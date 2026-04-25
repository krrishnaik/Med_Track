"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Search, Bell, LogOut, Stethoscope, History, Library, User, LayoutDashboard, X, CheckCircle, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';
import { getChecks } from '@/lib/historyService';

/* ══════════════════════════════════════════════════════════════════════════
   Search Command Palette — navigates to matching pages
   ══════════════════════════════════════════════════════════════════════════ */
const SEARCH_ITEMS = [
  { label: 'My Dashboard',      href: '/dashboard',           icon: LayoutDashboard, desc: 'Overview & stats' },
  { label: 'Check Medications', href: '/dashboard/checker',   icon: Stethoscope,     desc: 'AI interaction checker' },
  { label: 'Past Checks',       href: '/dashboard/history',   icon: History,         desc: 'Your check history' },
  { label: 'Drug Library',      href: '/dashboard/library',   icon: Library,         desc: 'Browse medications' },
  { label: 'My Profile',        href: '/dashboard/profile',   icon: User,            desc: 'Account & stats' },
];

function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard shortcut: Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = SEARCH_ITEMS.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-teal-900/15 border border-slate-200/60 overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-[var(--color-brand-teal)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, medications, reports…"
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none text-base font-medium"
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8 font-medium">No results for &quot;{query}&quot;</p>
          ) : (
            filtered.map(item => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-[1rem] hover:bg-[var(--color-brand-soft-teal)]/60 transition-all duration-200 text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-500 group-hover:bg-[var(--color-brand-teal)] group-hover:text-white transition-all duration-200 shrink-0">
                  <item.icon className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 tracking-tight">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400 font-medium">
          <span><kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">↑↓</kbd> navigate</span>
          <span><kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">↵</kbd> open</span>
          <span><kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Esc</kbd> close</span>
        </div>
      </div>

      {/* Backdrop */}
      <div className="absolute inset-0 -z-10 bg-slate-900/20 backdrop-blur-sm" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Notification Panel — shows recent checks as notifications
   ══════════════════════════════════════════════════════════════════════════ */
function riskIcon(level: string) {
  if (level === 'high') return <ShieldAlert className="w-4 h-4 text-rose-500" />;
  if (level === 'moderate') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <CheckCircle className="w-4 h-4 text-emerald-500" />;
}
function riskLabel(level: string) {
  if (level === 'high') return 'High Risk Detected';
  if (level === 'moderate') return 'Moderate Interaction';
  return 'Safe Check Complete';
}
function riskBg(level: string) {
  if (level === 'high') return 'bg-rose-50 border-rose-100';
  if (level === 'moderate') return 'bg-amber-50 border-amber-100';
  return 'bg-emerald-50 border-emerald-100';
}

function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [checks, setChecks] = useState<any[]>([]);

  useEffect(() => {
    if (open) setChecks(getChecks().slice(0, 5));
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute top-[calc(100%+10px)] right-0 w-80 bg-white/95 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl shadow-teal-900/10 border border-slate-200/60 overflow-hidden z-40"
        style={{ animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Notifications</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Recent medication checks</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {checks.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">Run a check to see results here</p>
            </div>
          ) : (
            checks.map((check, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border mb-1.5 ${riskBg(check.risk_level)}`}
              >
                <div className="mt-0.5 shrink-0">{riskIcon(check.risk_level)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 tracking-tight">{riskLabel(check.risk_level)}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {check.medications?.map((m: any) => m.name).join(', ') || 'Unknown drugs'}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(check.timestamp))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {checks.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Link
              href="/dashboard/history"
              onClick={onClose}
              className="block text-center text-xs font-bold text-[var(--color-brand-teal)] hover:underline transition-colors"
            >
              View all in History →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TopBar Component
   ══════════════════════════════════════════════════════════════════════════ */
export default function TopBar() {
  // ── Existing auth logic (UNTOUCHED) ──────────────────────────────────
  const [displayName, setDisplayName] = useState('User');
  const [initial, setInitial] = useState('U');
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
        setDisplayName('User');
        setInitial('U');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    console.log("⏱️ Auth Check [TopBar]:", authUser ? "User Found: " + authUser.uid : "Still Null...");
    if (!authUser) return;

    const fetchProfile = async () => {
      console.log("📡 Triggering Firestore Fetch [TopBar] for:", authUser.uid);
      let name = authUser.email?.split('@')[0] || 'User';
      try {
        const db = getFirestore();
        const docSnap = await getDoc(doc(db, 'users', authUser.uid));
        if (docSnap.exists() && docSnap.data().name) {
          name = docSnap.data().name;
        }
      } catch (error) {
        console.error("Failed to fetch user profile in TopBar", error);
      }
      setDisplayName(name);
      setInitial(name.charAt(0).toUpperCase());
    };

    fetchProfile();
  }, [authUser?.uid]);

  const handleSignOut = async () => {
    await signOut(auth);
    setDisplayName('User');
    setInitial('U');
    localStorage.removeItem('medtrack_history');
    localStorage.clear();
    window.location.href = '/login';
  };
  // ── End existing logic ───────────────────────────────────────────────

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

  // Global ⌘K shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Count unread (any checks in last 24h = unread)
  useEffect(() => {
    const checks = getChecks();
    const recent = checks.filter(c => Date.now() - c.timestamp < 86_400_000);
    setUnreadCount(recent.length);
  }, []);

  return (
    <>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="h-[72px] pl-[280px] fixed top-0 right-0 left-0 z-10 flex items-center justify-between px-8 bg-[var(--color-brand-cream)]/80 backdrop-blur-xl border-b border-slate-200/40">

        {/* ── Search Bar (clickable → opens palette) ─────────────────── */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-slate-200/60 bg-white/60 shadow-sm shadow-slate-200/30 hover:bg-white hover:border-slate-200 transition-all duration-300 ease-out max-w-sm w-full text-left hover:-translate-y-0.5 hover:shadow-md"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="flex-1 text-sm text-slate-400 font-medium">Search pages & medications…</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded-md border border-slate-200/60">
            ⌘K
          </kbd>
        </button>

        {/* ── Right: Bell + Profile + Logout ────────────────────────── */}
        <div className="flex items-center gap-3">

          {/* Notification bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setNotifOpen(v => !v)}
              className="relative w-10 h-10 rounded-full bg-white/60 border border-slate-200/50 flex items-center justify-center text-slate-500 hover:text-[var(--color-brand-teal)] hover:bg-white hover:border-[var(--color-brand-teal)]/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-900/5"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 rounded-full ring-2 ring-[var(--color-brand-cream)] text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Profile chip */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm shadow-slate-200/30 border border-slate-200/50 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-900/5 hover:border-[var(--color-brand-teal)]/20"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-brand-teal)] to-[var(--color-brand-teal-dark)] text-white flex items-center justify-center font-bold text-sm shadow-inner">
              {initial}
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden lg:inline tracking-tight">
              {displayName}
            </span>
          </Link>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full bg-white/60 border border-slate-200/50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200/50 transition-all duration-300 ease-out hover:-translate-y-0.5"
            title="Sign out"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </header>
    </>
  );
}