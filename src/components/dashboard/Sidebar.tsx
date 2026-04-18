"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pill, LayoutDashboard, Stethoscope, History, Library, User } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { name: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Check Medications', href: '/dashboard/checker', icon: Stethoscope },
  { name: 'Past Checks', href: '/dashboard/history', icon: History },
  { name: 'Drug Library', href: '/dashboard/library', icon: Library },
  { name: 'My Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white fixed top-0 left-0 h-full border-r border-slate-100 flex flex-col z-20 shadow-sm shadow-slate-200/50">
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 hover-lift">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-teal)] text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] flex items-center justify-center relative saturate-150">
            <Pill className="w-5 h-5 absolute opacity-90" />
          </div>
          <span className="font-serif text-2xl text-[var(--color-brand-teal-dark)]">MedTrack</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium hover-lift",
                  isActive
                    ? "bg-teal-50 text-[var(--color-brand-teal)] font-bold shadow-sm border border-teal-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                )
              )}
            >
              <item.icon className={twMerge(clsx("w-5 h-5", isActive ? "text-[var(--color-brand-teal)]" : "text-slate-400"))} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100">
         <div className="bg-[#F6F4ED] rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 mb-2 font-medium">Need help?</div>
            <a href="mailto:support@medtrack.example.com?subject=MedTrack Support Request" className="text-sm font-semibold text-[var(--color-brand-teal)] hover:underline block">Contact Support</a>
         </div>
      </div>
    </aside>
  );
}
