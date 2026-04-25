"use client";

import { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, CheckCircle, Clock, ShieldAlert, Zap, Box, Activity, Edit3, Save, X, Camera } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { getChecks } from '@/lib/historyService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// ── Avatar accent colour options ────────────────────────────────────────────
const AVATAR_COLORS = [
  { id: 'teal',    from: '#2B6A73', to: '#1A464C', label: 'Teal'    },
  { id: 'indigo',  from: '#4F46E5', to: '#3730A3', label: 'Indigo'  },
  { id: 'rose',    from: '#E11D48', to: '#9F1239', label: 'Rose'    },
  { id: 'amber',   from: '#D97706', to: '#92400E', label: 'Amber'   },
  { id: 'emerald', from: '#059669', to: '#065F46', label: 'Emerald' },
  { id: 'slate',   from: '#475569', to: '#1E293B', label: 'Slate'   },
];

export default function ProfilePage() {
  // ── Existing state & logic (UNTOUCHED) ────────────────────────────────────
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(!auth.currentUser);
  const [stats, setStats] = useState({
    totalChecks: 0, interactions: 0, safe: 0, cascades: 0, drugs: 0, lastCheck: 'Never',
  });
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        setUser(null);
        setStats({ totalChecks: 0, interactions: 0, safe: 0, cascades: 0, drugs: 0, lastCheck: 'Never' });
        setIsLoading(false);
      }
    });

    const calculateStats = () => {
      const history = getChecks() || [];
      let interactionsCount = 0, safeCount = 0, cascadesCount = 0, drugsCount = 0;
      history.forEach((c: any) => {
        const rawRisk = c.severity || c.risk_level || c.result?.severity || c.results?.severity || c.data?.severity || c.analysis?.severity || '';
        const risk = String(rawRisk).toLowerCase().trim();
        if (['high', 'moderate', 'critical', 'major'].includes(risk)) interactionsCount++;
        if (['low', 'safe', 'none'].includes(risk)) safeCount++;
        if (['high', 'critical', 'major'].includes(risk)) cascadesCount++;
        const count = c.analyzed_count || c.result?.analyzed_count || c.medications?.length || c.meds?.length || 0;
        drugsCount += count;
      });
      let lastCheckDate = 'Never';
      if (history.length > 0) {
        const timestamps = history.map((h: any) => {
          if (h.timestamp?.seconds) return h.timestamp.seconds * 1000;
          if (typeof h.timestamp === 'number') return h.timestamp;
          if (typeof h.timestamp === 'string') return new Date(h.timestamp).getTime();
          return Date.now();
        }).filter(Boolean);
        if (timestamps.length > 0) lastCheckDate = new Date(Math.max(...timestamps)).toLocaleDateString();
      }
      setStats({ totalChecks: history.length, interactions: interactionsCount, safe: safeCount, cascades: cascadesCount, drugs: drugsCount, lastCheck: lastCheckDate });
    };

    calculateStats();
    window.addEventListener('medtrack:history-updated', calculateStats);
    return () => { unsub(); window.removeEventListener('medtrack:history-updated', calculateStats); };
  }, []);

  useEffect(() => {
    console.log("⏱️ Auth Check:", user ? "User Found: " + user.uid : "Still Null...");
    if (!user) return; // Stay in loading state if null

    const fetchProfile = async () => {
      console.log("📡 Triggering Firestore Fetch for:", user.uid);
      try {
        const db = getFirestore();
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        
        if (docSnap.exists() && docSnap.data().name) {
          setUser((prev) => prev ? { ...prev, displayName: docSnap.data().name } as User : prev);
        } else {
          setUser((prev) => prev ? { ...prev, displayName: prev.email?.split('@')[0] || 'User' } as User : prev);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        setUser((prev) => prev ? { ...prev, displayName: prev.email?.split('@')[0] || 'User' } as User : prev);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.uid]);
  // ── End existing logic ────────────────────────────────────────────────────

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'No email provided';
  const initial = displayName.charAt(0).toUpperCase();

  // ── New UI state ───────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [avatarColor, setAvatarColor] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('medtrack_avatar_color') || 'teal';
    return 'teal';
  });

  const selectedColor = AVATAR_COLORS.find(c => c.id === avatarColor) || AVATAR_COLORS[0];

  const startEdit = () => { setNameInput(displayName); setEditing(true); setSaveMsg(''); };
  const cancelEdit = () => { setEditing(false); setSaveMsg(''); };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Loading profile...</div>;
  }

  const saveName = async () => {
    if (!user || !nameInput.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: nameInput.trim() });
      setSaveMsg('Saved!');
      setEditing(false);
    } catch {
      setSaveMsg('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectColor = (id: string) => {
    setAvatarColor(id);
    localStorage.setItem('medtrack_avatar_color', id);
  };

  const statCards = [
    { label: 'Total Checks Run',  value: stats.totalChecks,  icon: Activity,    color: 'text-slate-600',   bg: 'bg-slate-50'   },
    { label: 'Interactions Found', value: stats.interactions, icon: ShieldAlert, color: 'text-amber-600',   bg: 'bg-amber-50'   },
    { label: 'Safe Checks',       value: stats.safe,         icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Cascade Pathways',  value: stats.cascades,     icon: Zap,         color: 'text-rose-600',    bg: 'bg-rose-50'    },
    { label: 'Drugs Analyzed',    value: stats.drugs,        icon: Box,         color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
    { label: 'Last Check',        value: stats.lastCheck,    icon: Clock,       color: 'text-slate-400',   bg: 'bg-slate-50'   },
  ];

  return (
    <div className="space-y-7 max-w-4xl mx-auto pb-12">

      {/* ── Page heading ──────────────────────────────────────────────── */}
      <div style={{ opacity: 0, animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Account</p>
        <h1 className="text-3xl font-serif text-slate-800 tracking-tight">My Profile</h1>
      </div>

      {/* ── Identity card ─────────────────────────────────────────────── */}
      <div
        className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm shadow-teal-900/[0.03] border border-slate-100/70"
        style={{ opacity: 0, animation: 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s forwards' }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* Avatar */}
          <div className="relative shrink-0 group">
            <div
              className="w-28 h-28 rounded-[2rem] text-white flex items-center justify-center text-5xl font-serif shadow-lg transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})` }}
            >
              {initial}
            </div>
            {/* Colour picker trigger */}
            <button
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[var(--color-brand-teal)] transition-colors opacity-0 group-hover:opacity-100 duration-200"
              title="Change avatar colour"
              onClick={() => {/* scroll to picker */document.getElementById('color-picker')?.scrollIntoView({ behavior: 'smooth' })}}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            {/* Name row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1.5">
              {editing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="text-2xl font-serif text-slate-800 tracking-tight bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20 focus:border-[var(--color-brand-teal)]/30 w-full max-w-xs"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEdit(); }}
                  />
                  <button
                    onClick={saveName}
                    disabled={saving}
                    className="p-2.5 rounded-xl bg-[var(--color-brand-teal)] text-white hover:bg-[var(--color-brand-teal-dark)] transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEdit} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-serif text-slate-800 tracking-tight capitalize">{displayName}</h2>
                  <button
                    onClick={startEdit}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--color-brand-teal)] hover:bg-[var(--color-brand-soft-teal)] transition-all duration-200"
                    title="Edit display name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {saveMsg && (
              <p className={`text-xs font-semibold mb-2 ${saveMsg === 'Saved!' ? 'text-emerald-600' : 'text-rose-500'}`}>{saveMsg}</p>
            )}

            <p className="text-sm text-slate-400 mb-5 font-medium">{email}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-brand-soft-teal)] text-[var(--color-brand-teal-dark)] rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> MedTrack Member
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5" /> Verified
              </div>
              {stats.totalChecks >= 5 && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                  <Zap className="w-3.5 h-3.5" /> Power User
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Avatar colour picker ─────────────────────────────────── */}
        <div id="color-picker" className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Avatar Color</p>
          <div className="flex items-center gap-3 flex-wrap">
            {AVATAR_COLORS.map(col => (
              <button
                key={col.id}
                onClick={() => selectColor(col.id)}
                title={col.label}
                className={`w-9 h-9 rounded-full transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${avatarColor === col.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                style={{ background: `linear-gradient(135deg, ${col.from}, ${col.to})` }}
              />
            ))}
            <span className="text-xs text-slate-400 font-medium ml-1">
              {selectedColor.label} selected
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-5"
        style={{ opacity: 0, animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' }}
      >
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-[1.5rem] shadow-sm shadow-teal-900/[0.03] border border-slate-100/70 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:shadow-teal-900/[0.06]"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-serif text-slate-800 tracking-tight leading-none mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-semibold text-slate-400 tracking-tight">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}