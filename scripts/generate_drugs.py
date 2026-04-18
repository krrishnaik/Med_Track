import json
import random

# Categories and their typical drugs
categories = {
    "ACE Inhibitor": {
        "risk_base": "Medium",
        "combinations": ["NSAIDs (Reduced effect, renal stress)", "ARBs (Hyperkalemia)"],
        "side_effects": "Dry cough, hyperkalemia, fatigue, dizziness",
        "drugs": ["Lisinopril", "Ramipril", "Enalapril", "Benazepril", "Captopril", "Quinapril", "Fosinopril", "Trandolapril", "Moexipril", "Perindopril"]
    },
    "Beta Blocker": {
        "risk_base": "Medium",
        "combinations": ["Calcium Channel Blockers (Bradycardia)", "Digoxin (Heart block)"],
        "side_effects": "Fatigue, cold extremities, bradycardia, weight gain",
        "drugs": ["Metoprolol", "Atenolol", "Bisoprolol", "Propranolol", "Carvedilol", "Nebivolol", "Labetalol", "Nadolol", "Sotalol", "Timolol"]
    },
    "Calcium Channel Blocker": {
        "risk_base": "Low",
        "combinations": ["Beta Blockers (Bradycardia)", "CYP3A4 Inhibitors (Increased levels)"],
        "side_effects": "Edema, palpitations, flushing, dizziness",
        "drugs": ["Amlodipine", "Diltiazem", "Verapamil", "Nifedipine", "Felodipine", "Nicardipine", "Isradipine", "Nimodipine", "Clevidipine"]
    },
    "Statin": {
        "risk_base": "Medium",
        "combinations": ["Macrolides (Myopathy)", "Fibrates (Rhabdomyolysis)", "Grapefruit juice (CYP3A4 interactions)"],
        "side_effects": "Muscle pain, liver enzyme elevation, digestive issues",
        "drugs": ["Atorvastatin", "Rosuvastatin", "Simvastatin", "Pravastatin", "Lovastatin", "Fluvastatin", "Pitavastatin"]
    },
    "SSRI / Antidepressant": {
        "risk_base": "High",
        "combinations": ["MAOIs (Serotonin syndrome)", "NSAIDs (Bleeding risk)", "Tramadol (Seizure risk)"],
        "side_effects": "Nausea, insomnia, sexual dysfunction, weight changes",
        "drugs": ["Sertraline", "Fluoxetine", "Citalopram", "Escitalopram", "Paroxetine", "Fluvoxamine", "Vilazodone", "Vortioxetine"]
    },
    "NSAID": {
        "risk_base": "Medium",
        "combinations": ["ACE Inhibitors (Renal failure)", "SSRIs (GI Bleeding)", "Anticoagulants (Bleeding)"],
        "side_effects": "GI ulceration, kidney stress, increased blood pressure",
        "drugs": ["Ibuprofen", "Naproxen", "Diclofenac", "Celecoxib", "Meloxicam", "Indomethacin", "Ketorolac", "Piroxicam", "Nabumetone"]
    },
    "Benzodiazepine": {
        "risk_base": "High",
        "combinations": ["Opioids (Respiratory depression)", "Alcohol (Coma risk)", "Barbiturates (Lethal sedation)"],
        "side_effects": "Drowsiness, confusion, dependence, memory issues",
        "drugs": ["Alprazolam", "Clonazepam", "Lorazepam", "Diazepam", "Temazepam", "Midazolam", "Oxazepam", "Chlordiazepoxide"]
    },
    "Opioid": {
        "risk_base": "High",
        "combinations": ["Benzodiazepines (Respiratory depression)", "SSRIs (Serotonin syndrome)"],
        "side_effects": "Constipation, respiratory depression, addiction, nausea",
        "drugs": ["Oxycodone", "Hydrocodone", "Morphine", "Tramadol", "Fentanyl", "Codeine", "Methadone", "Buprenorphine", "Hydromorphone"]
    },
    "Antibiotic (Macrolide / Fluoroquinolone)": {
        "risk_base": "Medium",
        "combinations": ["Statins (Myopathy)", "Antacids (Reduced absorption)", "Antiarrhythmics (QT prolongation)"],
        "side_effects": "GI upset, tendon rupture (fluoro), QT prolongation",
        "drugs": ["Amoxicillin", "Azithromycin", "Clarithromycin", "Ciprofloxacin", "Levofloxacin", "Moxifloxacin", "Doxycycline", "Cephalexin"]
    },
    "Antidiabetic": {
        "risk_base": "Medium",
        "combinations": ["Beta Blockers (Masks hypoglycemia)", "Insulin (Severe hypoglycemia)"],
        "side_effects": "Hypoglycemia, GI upset (Metformin), weight gain",
        "drugs": ["Metformin", "Glipizide", "Glyburide", "Glimepiride", "Sitagliptin", "Empagliflozin", "Dapagliflozin", "Canagliflozin", "Pioglitazone"]
    },
    "Anticoagulant": {
        "risk_base": "High",
        "combinations": ["NSAIDs (Severe Bleeding)", "SSRIs (Bleeding)"],
        "side_effects": "Hemorrhage, bruising, GI bleeding",
        "drugs": ["Warfarin", "Apixaban", "Rivaroxaban", "Dabigatran", "Edoxaban", "Heparin", "Enoxaparin"]
    },
    "Proton Pump Inhibitor": {
        "risk_base": "Low",
        "combinations": ["Clopidogrel (Reduced effect with Omeprazole)", "Iron supplements (Reduced absorption)"],
        "side_effects": "Headache, diarrhea, B12 deficiency (long-term)",
        "drugs": ["Omeprazole", "Pantoprazole", "Esomeprazole", "Lansoprazole", "Rabeprazole", "Dexlansoprazole"]
    },
    "Antihistamine": {
        "risk_base": "Low",
        "combinations": ["CNS depressants (Sedation)"],
        "side_effects": "Drowsiness, dry mouth, blurred vision, dizziness",
        "drugs": ["Diphenhydramine", "Cetirizine", "Loratadine", "Fexofenadine", "Levocetirizine", "Chlorpheniramine", "Hydroxyzine"]
    },
    "Thyroid Hormone": {
        "risk_base": "Medium",
        "combinations": ["Calcium supplements (Reduced absorption)", "Iron (Reduced absorption)"],
        "side_effects": "Palpitations, weight loss, nervousness (if over-treated)",
        "drugs": ["Levothyroxine", "Liothyronine", "Desiccated thyroid"]
    },
    "Diuretic": {
        "risk_base": "Medium",
        "combinations": ["ACE Inhibitors (Hypotension)", "NSAIDs (Decreased diuretic effect)", "Digoxin (Toxicity via hypokalemia)"],
        "side_effects": "Dehydration, electrolyte imbalance, fatigue, urination",
        "drugs": ["Furosemide", "Hydrochlorothiazide", "Spironolactone", "Chlorthalidone", "Torsemide", "Bumetanide", "Amiloride"]
    },
    "Anticonvulsant": {
        "risk_base": "High",
        "combinations": ["Oral Contraceptives (Reduced efficacy)", "Other CNS depressants (Sedation)"],
        "side_effects": "Dizziness, drowsiness, rash, weight gain",
        "drugs": ["Gabapentin", "Pregabalin", "Levetiracetam", "Topiramate", "Lamotrigine", "Phenytoin", "Carbamazepine", "Valproic Acid"]
    },
    "Antineoplastic": {
        "risk_base": "High",
        "combinations": ["Immunosuppressants (Severe infection risk)"],
        "side_effects": "Nausea, hair loss, bone marrow suppression",
        "drugs": ["Abiraterone", "Cyclophosphamide", "Methotrexate", "Doxorubicin", "Paclitaxel", "Fluorouracil", "Cisplatin"]
    },
    "Antiviral": {
        "risk_base": "Medium",
        "combinations": ["Nephrotoxic drugs (Kidney damage)"],
        "side_effects": "Nausea, headache, renal issues",
        "drugs": ["Acyclovir", "Valacyclovir", "Oseltamivir", "Paxlovid", "Remdesivir", "Tenofovir"]
    },
    "Antiarrhythmic": {
        "risk_base": "High",
        "combinations": ["Beta Blockers (Heart block)", "Macrolides (QT prolongation)"],
        "side_effects": "Pulmonary toxicity (Amiodarone), QT prolongation, bradycardia",
        "drugs": ["Amiodarone", "Flecainide", "Propafenone", "Sotalol", "Dofetilide"]
    },
    "Corticosteroid": {
        "risk_base": "High",
        "combinations": ["NSAIDs (GI bleeding)", "Antidiabetics (Hyperglycemia)"],
        "side_effects": "Weight gain, osteoporosis, hyperglycemia, mood changes",
        "drugs": ["Prednisone", "Prednisolone", "Dexamethasone", "Hydrocortisone", "Methylprednisolone", "Budesonide"]
    }
}

database = []
# Ensure unique naming and flatten into a single list
for cat_name, cat_info in categories.items():
    for d in cat_info["drugs"]:
        # Randomize risk slightly occasionally
        risk = cat_info["risk_base"]
        
        database.append({
            "name": d,
            "class": cat_name,
            "risk": risk,
            "side_effects": cat_info["side_effects"],
            "dangerous_combinations": cat_info["combinations"]
        })

# Sort A-Z by name
database.sort(key=lambda x: x["name"])

with open("drugs_database.json", "w") as f:
    json.dump(database, f, indent=4)

print(f"Generated {len(database)} drugs in database.")
