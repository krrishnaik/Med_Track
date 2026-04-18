"use client";

import { useState, useRef } from 'react';
import { Pill, Beaker, Plus, Activity, AlertCircle, PlayCircle, ShieldCheck, RefreshCw, AlertTriangle, Download, CheckCircle2, Camera, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';
import { saveCheck, getChecks } from '@/lib/historyService';
import { LanguageSelector } from '@/components/dashboard/LanguageSelector';
import { useTranslation, getSpecialists, LANGUAGE_OPTIONS } from '@/components/dashboard/translations';

export default function CheckerPage() {
  const { t, lang, setLang } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [reading, setReading] = useState(false);
  
  const [analyzing, setAnalyzing]   = useState(false);
  const [results, setResults]       = useState<any>(null);
  const [saved, setSaved]           = useState(false);
  const [medications, setMedications] = useState([{ name: '', dose: '', specialist: 'Primary Care' }]);

  const handleAddDrug = () => {
    setMedications([...medications, { name: '', dose: '', specialist: 'Primary Care' }]);
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMedications(newMeds);
  };

  const readReportAloud = () => {
    if (reading) {
      window.speechSynthesis.cancel();
      setReading(false);
      return;
    }

    if (!results) return;

    const textToRead = `${results.short_analysis}. ${results.medium_analysis}. ${results.detailed_report}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    let targetLang = 'en-US';
    if (lang === 'hi') targetLang = 'hi-IN';
    else if (lang === 'mr') targetLang = 'mr-IN';
    else if (lang === 'bn') targetLang = 'bn-IN';
    else if (lang === 'ta') targetLang = 'ta-IN';
    else if (lang === 'te') targetLang = 'te-IN';
    else if (lang === 'gu') targetLang = 'gu-IN';

    utterance.lang = targetLang;

    // Explicitly try to pick a native voice for the selected language
    const voices = window.speechSynthesis.getVoices();
    const prefix = targetLang.split('-')[0];
    const nativeVoice = voices.find(v => v.lang.startsWith(prefix) || v.lang.startsWith(targetLang));
    if (nativeVoice) {
      utterance.voice = nativeVoice;
    }

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
            specialist: m.specialist || 'Primary Care'
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

  const loadDemo = () => {
    setSaved(false);
    setResults(null);
    setMedications([
      { name: 'Lisinopril',  dose: '10mg',  specialist: 'Primary Care' },
      { name: 'Amlodipine',  dose: '5mg',   specialist: 'Cardiologist' },
      { name: 'Ibuprofen',   dose: '400mg', specialist: 'Other' },
    ]);
  };

  const analyzeCascade = async () => {
    setAnalyzing(true);
    setResults(null);
    setSaved(false);

    try {
      const filtered = medications.filter((m) => m.name.trim() !== '');
      
      const history = getChecks() || [];
      const pastDrugs = history.flatMap(h => h.medications.map(m => m.name));

      // 1. CHANGED to relative path so it works locally and on Vercel
      const response = await fetch('/api/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          medications: filtered,
          language: LANGUAGE_OPTIONS.find(o => o.code === lang)?.label || 'English',
          context: { past_medications: pastDrugs }
        }),
      });

      // 2. ADDED safety check to prevent the "<!doctype html" parsing crash
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

      // ── Persist to history ───────────────────────────────────────────────
      saveCheck(filtered, data);
      setSaved(true);
    } catch (error) {
      console.error('Backend error:', error);
      // Even if backend is down provide a hard error state
      setResults({
        severity: 'Error — Backend Unreachable',
        short_analysis: 'Could not connect to the analysis server. Please ensure the Flask backend is running.',
        medium_analysis: '',
        detailed_report: '',
        analyzed_count: 0,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    try {
      if (!results) return;
      const html2pdf = (await import('html2pdf.js')).default;
      
      const medRows = medications
        .map((m) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${m.name}</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${m.dose}</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${m.specialist}</td></tr>`)
        .join('');

      let chartsHtml = '';
      if (results.chart_data) {
        const severityBars = (results.chart_data.severity_bars || []).map((bar: any) => `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; color: #475569; margin-bottom: 2px;">
              <span>${bar.name}</span>
              <span style="color: #e11d48;">${bar.percentage}%</span>
            </div>
            <div style="width: 100%; background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
              <div style="width: ${bar.percentage}%; background: #f43f5e; height: 100%;"></div>
            </div>
          </div>
        `).join('');

        const compareBars = (results.chart_data.combination_comparison || []).map((comp: any, idx: number) => `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; color: #475569; margin-bottom: 2px;">
              <span>${comp.label}</span>
              <span>${comp.value}% Risk</span>
            </div>
            <div style="width: 100%; background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
              <div style="width: ${comp.value}%; background: ${idx === 0 ? '#f43f5e' : '#10b981'}; height: 100%;"></div>
            </div>
          </div>
        `).join('');

        chartsHtml = `
          <div style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #f8fafc;">
            <h3 style="margin: 0 0 10px; font-size: 12px; color: #1e293b; text-transform: uppercase;">Quantitative Risk Data</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                <tr>
                  <td style="width: 25%; vertical-align: top; padding-right: 15px; border-right: 1px solid #cbd5e1;">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">Overall Risk</div>
                    <div style="font-size: 28px; font-weight: bold; color: #e11d48;">${results.chart_data.risk_score}%</div>
                    <div style="font-size: 11px; color: #10b981; font-weight: bold; margin-top: 4px;">Safety Score: ${results.chart_data.safety_score}%</div>
                  </td>
                  <td style="width: 37.5%; vertical-align: top; padding: 0 15px; border-right: 1px solid #cbd5e1;">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">Primary Risk Factors</div>
                    ${severityBars}
                  </td>
                  <td style="width: 37.5%; vertical-align: top; padding-left: 15px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">Alternatives Match</div>
                    ${compareBars}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }

      const html = `
        <div style="font-family:Georgia,serif;color:#1e293b;padding:32px;max-width:780px">
          <div style="border-bottom:2px solid #0d9488;margin-bottom:24px;padding-bottom:16px">
            <h1 style="margin:0;font-size:20px;color:#0d9488">MedTrack Interaction Report</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#64748b">${new Date().toLocaleDateString()}</p>
          </div>
          <h2 style="font-size:15px;margin-bottom:8px">Medications Analyzed</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px">
            <thead><tr style="background:#f8fafc">
              <th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Drug</th>
              <th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Dose</th>
              <th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Specialist</th>
            </tr></thead>
            <tbody>${medRows}</tbody>
          </table>
          <div style="background:#fff1f2;padding:14px;border-radius:10px;border:1px solid #fecdd3;margin-bottom:14px">
            <h3 style="margin:0 0 5px;font-size:12px;color:#be123c;text-transform:uppercase">Stage 1 (Side Effects)</h3>
            <p style="margin:0;font-size:13px;color:#9f1239">${results.short_analysis || 'None'}</p>
          </div>
          <div style="background:#fffbeb;padding:14px;border-radius:10px;border:1px solid #fde68a;margin-bottom:14px">
            <h3 style="margin:0 0 5px;font-size:12px;color:#92400e;text-transform:uppercase">Stage 2 (Interaction Context)</h3>
            <p style="margin:0;font-size:13px;color:#78350f">${results.medium_analysis || 'None'}</p>
          </div>
          ${chartsHtml}
          <div style="background:#f8fafc;padding:14px;border-radius:10px;border:1px solid #e2e8f0">
            <h3 style="margin:0 0 8px;font-size:12px;color:#1e293b;text-transform:uppercase">Stage 3 (Detailed Clinical Report)</h3>
            <pre style="margin:0;font-size:12px;color:#334155;white-space:pre-wrap;font-family:Georgia,serif">${results.detailed_report || 'None'}</pre>
          </div>
          <p style="font-size:11px;color:#94a3b8;text-align:center;padding-top:16px;margin-top:16px;border-top:1px solid #e2e8f0">Generated by MedTrack · Clinical decision support only.</p>
        </div>`;

      const el = document.createElement('div');
      el.innerHTML = html;
      document.body.appendChild(el);
      const opt: any = {
        margin:      0.4,
        filename:    `MedTrack-Report-${new Date().toISOString().slice(0,10)}.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF:       { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
      await html2pdf().set(opt).from(el).save();
      document.body.removeChild(el);
    } catch (e) {
      console.error('PDF error', e);
    }
  };

  const reset = () => {
    setResults(null);
    setSaved(false);
  };

  return (
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

      {/* ── Top Column (Inputs) ─────────────────────────────────────────────────── */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif text-slate-800">AI Interaction Cascade Checker</h2>
          <div></div>
        </div>

        {/* Medication inputs */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover-lift">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-slate-800">Patient medications</h3>
              <p className="text-sm text-slate-500">Enter full active medication list</p>
            </div>
          </div>

          <div className="space-y-4">
            {medications.map((med, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  {idx === 0 && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Drug name</label>}
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                    placeholder="e.g. Lisinopril"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:bg-white transition-colors text-sm"
                  />
                </div>
                <div className="col-span-3">
                  {idx === 0 && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dose</label>}
                  <input
                    type="text"
                    value={med.dose}
                    onChange={(e) => updateMedication(idx, 'dose', e.target.value)}
                    placeholder="10mg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:bg-white transition-colors text-sm"
                  />
                </div>
                <div className="col-span-4">
                  {idx === 0 && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Specialist</label>}
                  <select
                    value={med.specialist}
                    onChange={(e) => updateMedication(idx, 'specialist', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:bg-white transition-colors text-sm text-slate-700 appearance-none"
                  >
                    {getSpecialists(t).map((spec) => (
                      <option key={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddDrug}
              className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add another drug
            </button>
          </div>
        </div>

        {/* Saved badge */}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium animate-[fadeUp_0.4s_ease-out_forwards]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Saved to history — view it in the History tab.
          </div>
        )}

        {/* CTA */}
        <button
          onClick={analyzeCascade}
          disabled={analyzing}
          className={clsx(
            'w-full py-5 rounded-2xl text-white font-bold text-xl transition-all shadow-xl hover-lift flex items-center justify-center gap-3',
            analyzing
              ? 'bg-teal-700 cursor-wait shadow-teal-900/30'
              : 'bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] shadow-[var(--color-brand-teal)]/30',
          )}
        >
          {analyzing ? (
            <>
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              Groq Agent Validating Network...
            </>
          ) : (
            <>Analyze via Groq LLM <Activity className="w-6 h-6" /></>
          )}
        </button>
      </div>

      {/* ── Right Column ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-[600px] flex">
        {!results ? (
          <div className="w-full h-full bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
              <div className="w-[300px] h-[300px] bg-slate-100 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 mb-8 relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-2xl shadow-teal-500/40 transform rotate-45 border-4 border-white flex items-center justify-center overflow-hidden">
                  <div className="w-full h-1/2 bg-white/20 absolute top-0" />
                  <Beaker className="w-12 h-12 text-white -rotate-45 relative z-10" />
                </div>
              </div>
              <h3 className="text-3xl font-serif text-slate-800 mb-4 max-w-md leading-tight">
                Enter a patient's full medication list to reveal hidden cascade interaction risks.
              </h3>
              <p className="text-slate-500 mb-8 max-w-sm">
                Our Agentic reference engine cross-references drug classes and side effects.
              </p>
              <button
                onClick={loadDemo}
                className="px-6 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors hover-lift flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-slate-400" />
                Load Demo Patient Case
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-white rounded-[2rem] shadow-xl shadow-teal-900/5 border border-slate-100 p-8 flex flex-col animate-[fadeUp_0.6s_ease-out_forwards]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
              <h3 className="text-2xl font-serif text-slate-800">Cascade Analysis Report</h3>
              <div className="flex gap-2">
                <button
                  onClick={readReportAloud}
                  className="px-3 py-2 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Read Aloud"
                >
                  {reading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  {reading ? "Stop Reading" : "Read Aloud"}
                </button>
                <button
                  onClick={reset}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6" id="report-content">
              {/* 1. Status */}
              <div className="p-5 rounded-2xl border bg-slate-50 border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-slate-900">{results.severity}</h4>
                  <p className="text-sm text-slate-700">Analyzed {results.analyzed_count} active medications using Llama-3.3 LLM.</p>
                </div>
              </div>

              {/* Stage 1 */}
              {results.short_analysis && (
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm">
                  <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Stage 1 (Side Effects)
                  </h4>
                  <p className="text-rose-900 leading-relaxed text-base md:text-lg">{results.short_analysis}</p>
                </div>
              )}

              {/* Stage 2 */}
              {results.medium_analysis && (
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
                  <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Beaker className="w-4 h-4" /> Stage 2 (Interaction Context)
                  </h4>
                  <p className="text-amber-900 leading-relaxed text-base md:text-lg">{results.medium_analysis}</p>
                </div>
              )}

              {/* Stage 3 */}
              {results.detailed_report && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Stage 3 (Detailed Clinical Profile & Visuals)
                  </h4>
                  
                  {results.chart_data && (
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div className="flex flex-col items-center justify-center">
                        <h5 className="font-bold text-slate-700 mb-4 uppercase tracking-wider text-xs">Risk vs Safety Profile</h5>
                        <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-inner flex items-center justify-center border-4 border-white" 
                             style={{ background: `conic-gradient(#ef4444 ${results.chart_data.risk_score}%, #10b981 0)` }}>
                          <div className="bg-slate-50 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg">
                            <span className="font-black text-2xl text-slate-800">{results.chart_data.risk_score}%</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Risk</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-xs font-bold text-slate-600">
                           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Risk</div>
                           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Safety</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <h5 className="font-bold text-slate-700 mb-4 uppercase tracking-wider text-xs">Primary Risk Factors</h5>
                        <div className="space-y-4">
                          {(results.chart_data.severity_bars || []).map((bar: any, idx: number) => (
                            <div key={idx}>
                              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                <span className="truncate pr-2">{bar.name}</span>
                                <span className="text-rose-600">{bar.percentage}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${bar.percentage}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {results.chart_data.combination_comparison && results.chart_data.combination_comparison.length > 0 && (
                        <div className="col-span-1 md:col-span-2 mt-2 pt-6 border-t border-slate-200">
                          <h5 className="font-bold text-slate-700 mb-4 uppercase tracking-wider text-xs">Difference vs Safer Alternatives</h5>
                          <div className="flex flex-col gap-4">
                            {results.chart_data.combination_comparison.map((comp: any, idx: number) => (
                              <div key={idx} className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                  <span>{comp.label}</span>
                                  <span>{comp.value}% Risk</span>
                                </div>
                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                                  <div className={`h-full rounded-full transition-all ${idx === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${comp.value}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none whitespace-pre-wrap font-serif text-slate-700 text-sm md:text-base leading-relaxed">
                    {results.detailed_report}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 text-center mt-auto">
              <button
                onClick={downloadPDF}
                className="bg-[var(--color-brand-teal)] text-white px-6 py-3 rounded-xl font-bold transition hover:bg-[var(--color-brand-teal-dark)] shadow-lg shadow-teal-500/20 hover-lift inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download Full PDF Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}