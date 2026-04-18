"use client";

import { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, CheckCircle, Clock, ShieldAlert, Zap, Box, Activity } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getChecks } from '@/lib/historyService';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalChecks: 0,
    interactions: 0,
    safe: 0,
    cascades: 0,
    drugs: 0,
    lastCheck: 'Never',
  });

  useEffect(() => {
    // Listen to Firebase Auth
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        setUser(null);
        setStats({ totalChecks: 0, interactions: 0, safe: 0, cascades: 0, drugs: 0, lastCheck: 'Never' });
      }
    });

    // Listen to History Service
    const calculateStats = () => {
      const history = getChecks() || [];
      
      let interactionsCount = 0;
      let safeCount = 0;
      let cascadesCount = 0;
      let drugsCount = 0;

      history.forEach((c: any) => {
        // Bulletproof Risk Extraction: Digs through any possible nested structure
        const rawRisk = 
          c.severity || 
          c.risk_level || 
          c.result?.severity || 
          c.results?.severity || 
          c.data?.severity || 
          c.analysis?.severity || 
          '';
          
        const risk = String(rawRisk).toLowerCase().trim();

        // Tally based on the exact word returned by the Python backend
        if (['high', 'moderate', 'critical', 'major'].includes(risk)) interactionsCount++;
        if (['low', 'safe', 'none'].includes(risk)) safeCount++;
        if (['high', 'critical', 'major'].includes(risk)) cascadesCount++;

        // Bulletproof Drug Count Extraction
        const count = 
          c.analyzed_count || 
          c.result?.analyzed_count || 
          c.medications?.length || 
          c.meds?.length || 
          0;
        drugsCount += count;
      });
      
      let lastCheckDate = 'Never';
      if (history.length > 0) {
        // Bulletproof timestamp extraction
        const timestamps = history.map((h: any) => {
          if (h.timestamp?.seconds) return h.timestamp.seconds * 1000;
          if (typeof h.timestamp === 'number') return h.timestamp;
          if (typeof h.timestamp === 'string') return new Date(h.timestamp).getTime();
          return Date.now(); // Fallback
        }).filter(Boolean);
        
        if (timestamps.length > 0) {
          lastCheckDate = new Date(Math.max(...timestamps)).toLocaleDateString();
        }
      }

      setStats({ 
        totalChecks: history.length, 
        interactions: interactionsCount, 
        safe: safeCount, 
        cascades: cascadesCount, 
        drugs: drugsCount, 
        lastCheck: lastCheckDate 
      });
    };

    calculateStats();
    
    // Listen for new checks being saved
    window.addEventListener('medtrack:history-updated', calculateStats);

    return () => {
      unsub();
      window.removeEventListener('medtrack:history-updated', calculateStats);
    };
  }, []);

  // Dynamically pull real user info to match your TopBar
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'No email provided';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif text-slate-800 mb-8">My Profile</h1>

      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10 hover-lift animate-[fadeUp_0.6s_ease-out_forwards]">
        <div className="w-40 h-40 rounded-full bg-[var(--color-brand-teal)] text-white flex items-center justify-center text-7xl font-serif shadow-xl shadow-teal-900/20 shrink-0 relative animate-float">
           {initial}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-800 mb-2 capitalize">{displayName}</h2>
          <p className="text-slate-500 text-lg mb-6">{email}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-[var(--color-brand-teal)] rounded-full text-sm font-bold">
              <ShieldCheck className="w-4 h-4" />
              MedTrack Member
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">
              <UserCheck className="w-4 h-4" />
              ✓ Verified
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-[fadeUp_0.8s_ease-out_forwards]" style={{ animationDelay: '0.2s' }}>
        {[
          { label: 'Total Checks Run', value: stats.totalChecks, icon: Activity, color: 'text-slate-600' },
          { label: 'Interactions Found', value: stats.interactions, icon: ShieldAlert, color: 'text-amber-600' },
          { label: 'Safe Checks', value: stats.safe, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Cascade Pathways', value: stats.cascades, icon: Zap, color: 'text-rose-600' },
          { label: 'Drugs Analyzed', value: stats.drugs, icon: Box, color: 'text-indigo-600' },
          { label: 'Last Check', value: stats.lastCheck, icon: Clock, color: 'text-slate-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover-lift">
             <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
             </div>
             <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
             <div className="text-sm font-medium text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}