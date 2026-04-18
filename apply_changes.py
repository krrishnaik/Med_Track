import re
import os

file_path = r"c:\Users\RAVI\Desktop\Med-Track\src\app\dashboard\checker\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Imports
imports = """import { useState, useRef } from 'react';
import { Pill, Beaker, Plus, Activity, AlertCircle, PlayCircle, ShieldCheck, RefreshCw, AlertTriangle, Download, CheckCircle2, Camera, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';
import { saveCheck } from '@/lib/historyService';
import { LanguageSelector } from '@/components/dashboard/LanguageSelector';
import { useTranslation, getSpecialists, LANGUAGE_OPTIONS } from '@/components/dashboard/translations';"""

content = re.sub(
    r"import \{ useState \} from 'react';.*?import \{ saveCheck \} from '@/lib/historyService';",
    imports,
    content,
    flags=re.DOTALL
)

# 2. Add Hooks and State
hooks = """export default function CheckerPage() {
  const { t, lang, setLang } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [reading, setReading] = useState(false);
  
  const [analyzing, setAnalyzing]   = useState(false);"""

content = re.sub(
    r"export default function CheckerPage\(\) \{\n\s*const \[analyzing, setAnalyzing\]\s*=\s*useState\(false\);",
    hooks,
    content,
    flags=re.DOTALL
)

# 3. Add Speech and Scan Functions
functions = """  const readReportAloud = () => {
    if (reading) {
      window.speechSynthesis.cancel();
      setReading(false);
      return;
    }

    if (!results) return;

    const textToRead = `${results.short_analysis}. ${results.medium_analysis}. ${results.detailed_report}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'mr') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => setReading(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setReading(true);
  };

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        const response = await fetch('/api/scan-prescription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });
        
        if (!response.ok) throw new Error('Failed to scan image');
        
        const data = await response.json();
        if (data.medications && data.medications.length > 0) {
          const newMeds = data.medications.map((m: any) => ({
            name: m.name || '',
            dose: m.dose || '',
            specialist: 'Primary Care'
          }));
          setMedications(newMeds);
        }
      };
    } catch (error) {
      console.error('Scan error:', error);
      alert(t('uploadError'));
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const loadDemo = () => {"""

content = re.sub(
    r"  const loadDemo = \(\) => \{",
    functions,
    content
)

# 4. Update fetch language in analyzeCascade
fetch_call = """      const response = await fetch('/api/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          medications: filtered,
          language: LANGUAGE_OPTIONS.find(o => o.code === lang)?.label || 'English'
        }),
      });"""

content = re.sub(
    r"      const response = await fetch\('/api/check-interactions'.*?body: JSON\.stringify\(\{ medications: filtered \}\),\n      \}\);",
    fetch_call,
    content,
    flags=re.DOTALL
)

# 5. Add Navbar and top structure
navbar = """  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleScanImage} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl font-medium transition-colors"
          >
            <Camera className="w-5 h-5" />
            {scanning ? t('readingPrescription') : t('uploadPrescription')}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Language:</span>
          <LanguageSelector lang={lang} setLang={setLang} />
        </div>
      </div>

      {/* ── Top Column (Inputs) ─────────────────────────────────────────────────── */}"""

content = re.sub(
    r"  return \(\n    <div className=\"flex flex-col gap-8 pb-16\">\n      \{\/\* ── Top Column \(Inputs\) ─────────────────────────────────────────────────── \*\/\}",
    navbar,
    content,
    flags=re.DOTALL
)

# 6. Add Read Aloud button in Results header
results_header = """            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
              <h3 className="text-2xl font-serif text-slate-800">Cascade Analysis Report</h3>
              <div className="flex gap-2">
                <button
                  onClick={readReportAloud}
                  className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Read Aloud"
                >
                  {reading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={reset}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>"""

content = re.sub(
    r"            <div className=\"flex items-center justify-between border-b border-slate-100 pb-6 mb-6\">\n              <h3 className=\"text-2xl font-serif text-slate-800\">Cascade Analysis Report</h3>\n              <button\n                onClick=\{reset\}\n                className=\"p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors\"\n              >\n                <RefreshCw className=\"w-5 h-5\" />\n              </button>\n            </div>",
    results_header,
    content,
    flags=re.DOTALL
)

# 7. Add specialist translations
specialists_map = """                    {getSpecialists(t).map((spec) => (
                      <option key={spec}>{spec}</option>
                    ))}"""
                    
content = re.sub(
    r"                    <option>Allergist/Immunologist</option>.*?<option>Other</option>",
    specialists_map,
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
