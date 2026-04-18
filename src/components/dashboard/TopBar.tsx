"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function TopBar() {
  const [displayName, setDisplayName] = useState('User');
  const [initial, setInitial] = useState('U');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split('@')[0] || 'User';
        setDisplayName(name);
        setInitial(name.charAt(0).toUpperCase());
      } else {
        setDisplayName('User');
        setInitial('U');
      }
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    
    // Wipe local storage so the next user starts with a completely clean history
    localStorage.removeItem('medtrack_history');
    localStorage.clear(); 
    
    // Hard reload to completely flush the browser memory
    window.location.href = '/login';
  };

  return (
    <header className="h-20 pl-64 fixed top-0 right-0 left-0 bg-[var(--color-brand-cream)] z-10 border-b border-slate-200/50 flex items-center justify-end px-8">
      {/* Top text removed, contents aligned to the right automatically */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard/profile" className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 cursor-pointer hover-lift">
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand-teal)] text-white flex items-center justify-center font-bold text-sm">
            {initial}
          </div>
          <span className="text-sm font-semibold text-slate-700">{displayName}</span>
        </Link>
        <button onClick={handleSignOut} className="text-sm text-slate-500 hover:text-rose-600 transition-colors font-medium">
          Sign out
        </button>
      </div>
    </header>
  );
}