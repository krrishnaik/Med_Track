import Link from 'next/link';
import { ArrowRight, Pill } from 'lucide-react';

export default function LoginPage() {
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

        <form className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" autoComplete="off" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:border-[var(--color-brand-teal)] transition-all bg-white/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" autoComplete="new-password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:border-[var(--color-brand-teal)] transition-all bg-white/50" />
            <div className="text-right mt-2">
               <a href="#" className="text-sm text-[var(--color-brand-teal-light)] hover:text-[var(--color-brand-teal)]">Forgot password?</a>
            </div>
          </div>
          
          <Link href="/dashboard" className="w-full py-4 rounded-xl bg-[var(--color-brand-teal)] text-white font-medium text-lg hover:bg-[var(--color-brand-teal-dark)] transition-all hover-lift shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 mt-4">
            Sign In <ArrowRight className="w-5 h-5" />
          </Link>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <Link href="/signup" className="text-[var(--color-brand-teal)] font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
