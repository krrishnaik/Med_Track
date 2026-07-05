"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Stethoscope, History, Library, User, HeartPulse, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { name: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Check Medications', href: '/dashboard/checker', icon: Stethoscope },
  { name: 'Past Checks', href: '/dashboard/history', icon: History },
  { name: 'Drug Library', href: '/dashboard/library', icon: Library },
  { name: 'My Profile', href: '/dashboard/profile', icon: User },
];

/* ══════════════════════════════════════════════════════════════════════════
   MedTrack Logo — matches the screenshot exactly:
   Teal shield with a white person/user silhouette inside
   ══════════════════════════════════════════════════════════════════════════ */
export function MedTrackLogo() {
  return (
    <div className="w-10 h-10 relative animate-logo-entrance shrink-0">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Teal Rounded Square */}
        <rect x="2" y="2" width="44" height="44" rx="14" fill="#1e5c66" />
        {/* Pill Outline rotated */}
        <g transform="translate(24, 24) rotate(-45) translate(-24, -24)">
          <rect x="14" y="20" width="20" height="8" rx="4" stroke="white" strokeWidth="2.5" />
          <line x1="24" y1="20" x2="24" y2="28" stroke="white" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}

export default function Sidebar({ isCollapsed = false, toggleSidebar }: { isCollapsed?: boolean; toggleSidebar?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`bg-white/70 backdrop-blur-xl fixed top-0 left-0 h-full border-r border-slate-100/60 flex flex-col z-20 shadow-sm shadow-slate-200/30 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[88px]' : 'w-[280px]'}`}>

      {/* ── Brand Header ──────────────────────────────────────────────── */}
      <div className="h-[72px] flex items-center justify-between px-6 border-b border-slate-100/60">
        <Link href="/" className={`flex items-center gap-3 group transition-all duration-300 hover:-translate-y-0.5 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <MedTrackLogo />
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300">
              <span className="font-serif text-xl tracking-tight text-[var(--color-brand-teal-dark)] leading-none">
                MedTrack
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-[0.15em] uppercase leading-none mt-1">
                Health Intelligence
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
        <div className="px-3 mb-4 flex items-center justify-between">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap transition-opacity duration-300">
              Navigation
            </p>
          )}
          {toggleSidebar && (
            <button onClick={toggleSidebar} className="p-1 rounded-md text-slate-400 hover:text-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal)]/10 transition-colors mx-auto" title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={twMerge(
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-[1rem] transition-all duration-300 ease-out font-medium text-sm relative group overflow-hidden whitespace-nowrap",
                  isActive
                    ? "bg-[var(--color-brand-soft-teal)] text-[var(--color-brand-teal-dark)] font-semibold shadow-sm shadow-teal-900/5"
                    : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-800 hover:-translate-y-0.5"
                )
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-[var(--color-brand-teal)] to-[var(--color-brand-teal-light)] rounded-full shadow-sm" />
              )}
              <div className={twMerge(
                clsx(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                  isActive
                    ? "bg-[var(--color-brand-teal)] text-white shadow-sm shadow-teal-900/20"
                    : "bg-slate-100/60 text-slate-400 group-hover:bg-[var(--color-brand-soft-teal)] group-hover:text-[var(--color-brand-teal)]"
                )
              )}>
                <item.icon className="w-[18px] h-[18px]" />
              </div>
              {!isCollapsed && <span className="tracking-tight transition-opacity duration-300">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom CTA Card ───────────────────────────────────────────── */}
      <div className="p-4">
        <div className={clsx("bg-gradient-to-br from-[var(--color-brand-soft-teal)] to-[var(--color-brand-lavender)] rounded-[1.5rem] p-5 text-center relative overflow-hidden transition-all duration-300", isCollapsed ? 'p-3' : '')}>
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-[var(--color-brand-teal)]/10 rounded-full blur-xl animate-breathe pointer-events-none" />
          <div className="relative z-10">
            <div className="w-10 h-10 mx-auto rounded-full bg-white/80 shadow-sm flex items-center justify-center mb-3">
              <HeartPulse className="w-5 h-5 text-[var(--color-brand-teal)]" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <p className="text-xs font-semibold text-slate-600 mb-1 tracking-tight">Need Help?</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Our clinical support team is here for you.
                </p>
                <a
                  href="mailto:support@medtrack.example.com?subject=MedTrack Support Request"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[var(--color-brand-teal)] to-[var(--color-brand-teal-dark)] px-4 py-2 rounded-full shadow-sm shadow-teal-900/15 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-900/20"
                >
                  Contact Support
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
