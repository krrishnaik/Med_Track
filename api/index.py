import os
import json
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from data_parser import store

# (Removed the broken google.generativeai import since you use Groq now!)

load_dotenv()
app = Flask(__name__)
CORS(app)

# -----------------
# Library Endpoints
# -----------------

@app.route('/api/library/index', methods=['GET'])
def get_library_index():
    all_drugs = store.get_all_drugs()
    
    grouped = {}
    for d in all_drugs:
        letter = d[0].upper() if d else '#'
        if not letter.isalpha(): letter = '#'
        if letter not in grouped: grouped[letter] = []
        grouped[letter].append(d)
        
    return jsonify({"letters": grouped, "total_count": len(all_drugs)})

@app.route('/api/library/drug/<path:drug_name>', methods=['GET'])
def get_drug_details(drug_name):
    details = store.get_drug_interactions(drug_name)
    return jsonify(details)


# -----------------
# Agent Endpoints
# -----------------

def run_agent_analysis(medications, context, language="English"):
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    
    # Find active interactions for the user's checklist
    results = []
    meds_title = [m.title() for m in medications]
    active_set = set(meds_title)
    
    for p in store.pairwise_interactions:
        if p["drug_a"] in active_set and p["drug_b"] in active_set:
            results.append(p)
    
    # FIX: Made the check case-insensitive so it actually finds "MAJOR" risks!
    major_count = len([x for x in results if x.get("severity", "").upper() == "MAJOR"])

    # --- THIS CALCULATES THE ACTUAL SEVERITY BADGE FOR THE UI ---
    if len(medications) == 0:
        calc_severity = "Safe"
    elif major_count > 0:
        calc_severity = "Critical" if major_count > 1 else "High"
    elif len(results) > 0:
        calc_severity = "Moderate"
    else:
        calc_severity = "Safe"

    prompt = f"""
    You are an expert pharmacological AI agent.
    The patient is currently taking: {', '.join(medications)}
    Patient historical medication context: {json.dumps(context)}
    
    We cross-referenced our real datasets and found these specific interactions:
    {json.dumps(results)}

    Based on the provided datasets, the patient's historical context, and your general medical knowledge, analyze this medication combination. Specifically reference their past medication history if relevant to the current risks to provide a highly personalized analysis.
    Output MUST be in JSON format with exactly these four keys:
    1. "short_analysis": (Stage 1 - Side effects) Write 1 to 2 complete, descriptive sentences (at least 15 words) detailing the primary side effects and critical risks of combining these specific medications. Write this in {language}.
    2. "medium_analysis": (Stage 2 - Interaction context) Exactly a 4-5 line paragraph explaining why the given combination might be unsafe compared to other options, explaining why safer alternatives would be better, and suggesting specific compatible medicine alternatives with accurate data. Write this in {language}.
    3. "detailed_report": (Stage 3 - Detailed report) A detailed and comprehensively informative report. Write this in a warm, empathetic, completely human-like and conversational voice. Imagine you are a caring doctor explaining the interactions, mechanisms, and alternatives directly to a patient. Do not sound robotic or use sterile bullet lists. Make it approachable but very detailed. Write this in {language}.
    4. "chart_data": (Stage 3 - Data) Provide a JSON object for visual comparison: {{"safety_score": 0-100, "risk_score": 0-100, "severity_bars": [{{"name": "Specific interaction/risk name", "percentage": 0-100}}], "combination_comparison": [{{"label": "Current Risk", "value": 0-100}}, {{"label": "Safer Alternative Risk", "value": 0-100}}]}}.

    Output STRICTLY parsed JSON only. Do not include markdown code blocks around the JSON output.
    """

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a clinical pharmacologist AI. Always reply with valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Clean up possible markdown wrappers around JSON formatting
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
            
        parsed_content = json.loads(content)
        
        disclaimer = "\n\n*Disclaimer: MedTrack provides AI-driven clinical insights to empower your health journey, best used in collaboration with your doctor's professional expertise.*"
        
        return {
            "status": "success",
            "severity": calc_severity,  # <--- Replaced hardcoded "Analyzed" with the real calculated severity
            "analyzed_count": len(medications),
            "short_analysis": parsed_content.get("short_analysis", "No short analysis provided."),
            "medium_analysis": parsed_content.get("medium_analysis", "No medium analysis provided."),
            "detailed_report": parsed_content.get("detailed_report", "No detailed report provided.") + disclaimer,
            "chart_data": parsed_content.get("chart_data", {"safety_score": 50, "risk_score": 50, "severity_bars": []})
        }
    except Exception as e:
        print("Groq API Error:", e)

    # Fallback in case of error
    print("WARNING: Using simulated agent due to an API error.")
    time.sleep(1.5)
    
    short_txt = f"Total interactions found: {len(results)} ({major_count} Major)."
    
    details = ""
    for r in results:
         details += f"**{r['drug_a']} + {r['drug_b']} ({r['severity']} Risk)**: {r['desc']}\\n\\n"

    med_txt = f"The interaction between {' and '.join(medications)} triggers {len(results)} clinical flags detected in the DDI/DrugBank databases."
    
    det_txt = f"# Detailed Interaction Report\\n\\n## Medications Analyzed\\n{', '.join(medications)}\\n\\n## Detected Interaction Database Findings\\n{details if details else 'No interactions found in the database.'}\\n\\n## Clinical Management\\n- Check specific enzyme overlaps.\\n- Consider safer alternatives if symptoms arise.\\n\\n## Overall Assessment\\n**SEVERITY: {'HIGH' if major_count > 0 else 'MODERATE' if results else 'LOW'}**"

    disclaimer = "\n\n*Disclaimer: This response is AI-generated. Please consult a professional doctor for medical advice.*"
    det_txt += disclaimer

    return {
        "status": "success",
        "severity": calc_severity, # <--- Also replaced here in the fallback
        "analyzed_count": len(medications),
        "short_analysis": short_txt,
        "medium_analysis": med_txt,
        "detailed_report": det_txt
    }

@app.route('/api/check-interactions', methods=['POST'])
def check_interactions():
    data = request.json
    if not data or 'medications' not in data:
        return jsonify({"error": "No medications provided"}), 400
    
    medications = [m.get('name', '') for m in data['medications'] if m.get('name')]
    context = data.get('context', {})
    language = data.get('language', 'English')
    
    results = run_agent_analysis(medications, context, language)
    return jsonify(results)

@app.route('/api/scan-prescription', methods=['POST'])
def scan_prescription():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image provided"}), 400

    base64_image = data['image']
    if base64_image.startswith('data:'):
        base64_image = base64_image.split(',')[1]

    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": "Extract all medications and their dosages from this prescription image. Also estimate the most likely prescribing specialist (e.g. 'Cardiologist', 'Endocrinologist', 'Primary Care'). Output strictly as a JSON array of objects. Format: [{\"name\": \"Medication Name\", \"dose\": \"Dosage\", \"specialist\": \"Specialist Name\"}]. Only output the JSON array, no other text."
                    },
                    {
                        "type": "image_url", 
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    }
                ]
            }
        ],
        "temperature": 0.1
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        resp_data = response.json()
        content = resp_data["choices"][0]["message"]["content"].strip()
        
        # Clean markdown
        if content.startswith("```json"): content = content[7:]
        elif content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        content = content.strip()
        
        parsed_drugs = json.loads(content)
        return jsonify({"status": "success", "medications": parsed_drugs})
    except Exception as e:
        print("Vision API Error:", e)
        return jsonify({"error": "Failed to parse prescription image"}), 500

@app.route('/api/extract-medications', methods=['POST'])
def extract_medications():
    data = request.json
    if not data or 'transcript' not in data:
        return jsonify({"error": "No transcript provided"}), 400

    transcript = data['transcript'].strip()
    if not transcript:
        return jsonify({"error": "Empty transcript"}), 400

    # Use Groq to extract medications from the transcript
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    groq_headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "user",
                "content": f"Extract all medications and their dosages from the following transcript. Also estimate the most likely prescribing specialist (e.g. 'Cardiologist', 'Endocrinologist', 'Primary Care'). Output strictly as a JSON array of objects. Format: [{{\"name\": \"Medication Name\", \"dose\": \"Dosage\", \"specialist\": \"Specialist Name\"}}]. If a dosage is not mentioned, leave dose as an empty string. Only output the JSON array, no other text.\n\nTranscript: {transcript}"
            }
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=groq_headers, json=payload)
        response.raise_for_status()
        resp_data = response.json()
        content = resp_data["choices"][0]["message"]["content"].strip()
        
        # Clean markdown
        if content.startswith("```json"): content = content[7:]
        elif content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        content = content.strip()
        
        parsed = json.loads(content)
        
        # Handle if LLM wraps in an object like {"medications": [...]}
        if isinstance(parsed, dict):
            parsed_drugs = parsed.get("medications", parsed.get("drugs", []))
        elif isinstance(parsed, list):
            parsed_drugs = parsed
        else:
            parsed_drugs = []
            
        return jsonify({"status": "success", "medications": parsed_drugs, "transcript": transcript})
    except Exception as e:
        print("Groq Extraction Error:", e)
        return jsonify({"error": "Failed to extract medications from transcript"}), 500

if __name__ == '__main__':
    app.run(debug=False, port=5000, use_reloader=False)