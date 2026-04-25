"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Pill } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error("Firebase Sign-In Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[100px] animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-200/40 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-teal-900/10 border border-white/50 relative z-10 animate-[fadeUp_0.8s_ease-out_forwards]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-brand-teal)] text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] flex items-center justify-center relative saturate-150 mx-auto mb-4 hover-lift">
            <Pill className="w-7 h-7 absolute opacity-90" />
          </div>
          <h1 className="text-3xl font-serif text-slate-800 mb-2">Welcome Back</h1>
          <p className="text-slate-500">Sign in to securely check your medications.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm text-center font-medium animate-[fadeUp_0.3s_ease-out_forwards]">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" 
              placeholder="you@example.com" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:border-[var(--color-brand-teal)] transition-all bg-white/50" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" 
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:border-[var(--color-brand-teal)] transition-all bg-white/50" 
            />
            <div className="text-right mt-2">
               <a href="#" className="text-sm text-[var(--color-brand-teal-light)] hover:text-[var(--color-brand-teal)]">Forgot password?</a>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[var(--color-brand-teal)] text-white font-medium text-lg hover:bg-[var(--color-brand-teal-dark)] transition-all hover-lift shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : (
              <>Sign In <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <Link href="/signup" className="text-[var(--color-brand-teal)] font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
