import Link from 'next/link';
import { Shield, ArrowRight, Activity, Database, Server, Component, Pill } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F6F4ED]/80 backdrop-blur-md border-b border-teal-900/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover-lift">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-teal)] text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] flex items-center justify-center relative saturate-150">
              <Pill className="w-5 h-5 absolute opacity-90" />
            </div>
            <span className="font-serif text-2xl text-[var(--color-brand-teal-dark)]">MedTrack</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-slate-600 hover:text-[var(--color-brand-teal)] font-medium transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-5 py-2.5 rounded-full bg-[var(--color-brand-teal)] text-white font-medium hover:bg-[var(--color-brand-teal-dark)] transition-colors hover-lift shadow-md shadow-teal-900/20">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 animate-[fadeUp_0.8s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-[var(--color-brand-teal-dark)] text-sm font-semibold tracking-wide hover-lift">
            <Shield className="w-4 h-4" />
            <span>AI-Powered Safety</span>
          </div>
          <h1 className="text-6xl md:text-7xl text-slate-900 leading-tight">
            Stop the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-teal)] to-sky-500 font-extrabold drop-shadow-sm">Prescription Cascade.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
            Don't let medication side effects be mistaken for new medical conditions. Run comprehensive checks to see how your drugs interact safely.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Link href="/signup" className="px-8 py-4 rounded-full bg-[var(--color-brand-teal)] text-white font-medium text-lg hover:bg-[var(--color-brand-teal-dark)] transition-all hover-lift shadow-[0_8px_30px_rgb(20,184,166,0.3)] hover:shadow-[0_8px_40px_rgb(20,184,166,0.5)] flex items-center gap-2 ring-4 ring-teal-500/10 hover:ring-teal-500/30">
              Start Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="flex-1 relative w-full h-[500px] flex items-center justify-center">
          {/* Abstract floating background blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-teal-300/40 rounded-full blur-[80px] animate-float mix-blend-multiply" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-sky-300/40 rounded-full blur-[80px] animate-float mix-blend-multiply" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-rose-200/30 rounded-full blur-[60px] animate-float mix-blend-multiply" style={{ animationDelay: '4s' }}></div>

          {/* Floating Glassmorphic Drug Cards */}
          <div className="relative w-full max-w-md h-full">
            <div className="absolute top-[10%] right-[10%] w-[260px] p-5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 animate-float hover-lift" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-slate-800">Lisinopril</h3>
                  <p className="text-xs text-slate-500">10mg • Daily</p>
                </div>
              </div>
              <div className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg">
                ⚠️ Potential interaction detected
              </div>
            </div>

            <div className="absolute top-[40%] left-[0%] w-[280px] p-5 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 animate-float border border-white/50 z-10 hover-lift" style={{ animationDelay: '1.5s' }}>
               <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-teal)] text-white flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-slate-800">Safety Check</h3>
                  <p className="text-sm text-slate-500">Analyzing cascade...</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div className="bg-[var(--color-brand-teal)] h-2 rounded-full w-[75%] transition-all duration-1000"></div>
              </div>
            </div>

            <div className="absolute bottom-[10%] right-[5%] w-[240px] p-5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 animate-float hover-lift" style={{ animationDelay: '2.5s' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-slate-800">Amlodipine</h3>
                  <p className="text-xs text-slate-500">5mg • Daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Problem Grid */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-[fadeUp_0.6s_ease-out_forwards]">
            <h2 className="text-4xl md:text-5xl text-slate-900 mb-4">Understanding the Problem</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">How the prescription cascade silently creates new health problems.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[ 
              { step: '01', title: 'Drug Causes Side Effect', desc: 'A newly prescribed medication causes an unintended but common side effect.' },
              { step: '02', title: 'Mistaken for Config', desc: 'The side effect is misdiagnosed as a new, separate medical condition.' },
              { step: '03', title: 'Another Drug Prescribed', desc: 'A secondary drug is added to treat the condition, compounding toxicity.' }
            ].map((item, i) => (
              <div key={i} className="bg-[#F6F4ED] p-8 rounded-3xl hover-lift shadow-sm shadow-slate-200/50 border border-slate-100/50">
                <div className="text-5xl font-serif text-[var(--color-brand-teal-light)] opacity-40 mb-6">{item.step}</div>
                <h3 className="text-2xl font-serif text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Architecture Section */}
      <section className="py-24 bg-[#1F4C53] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-brand-teal)] rounded-full blur-[120px] opacity-30 animate-float"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <h2 className="text-4xl md:text-5xl mb-6 font-serif">Robust Architecture</h2>
              <p className="text-teal-100 text-lg mb-8 leading-relaxed max-w-md">
                MedTrack is powered by an architecture separating heavy analytical logic from the fast, interactive user interface.
              </p>
              <ul className="space-y-6 max-w-md">
                <li className="flex items-start gap-4 hover-lift p-3 -m-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-teal-800/50 flex items-center justify-center shrink-0 border border-teal-700/50">
                    <Component className="w-6 h-6 text-teal-200" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif mb-1">React / Next.js</h4>
                    <p className="text-teal-200/70 text-sm">Blazing fast UI with beautiful anti-gravity styling and seamless interactions.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 hover-lift p-3 -m-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-teal-800/50 flex items-center justify-center shrink-0 border border-teal-700/50">
                    <Server className="w-6 h-6 text-teal-200" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif mb-1">Flask Python Engine</h4>
                    <p className="text-teal-200/70 text-sm">Heavy lifting for drug normalization and cascade pathway analysis.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 hover-lift p-3 -m-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-teal-800/50 flex items-center justify-center shrink-0 border border-teal-700/50">
                    <Database className="w-6 h-6 text-teal-200" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif mb-1">Firebase Identity</h4>
                    <p className="text-teal-200/70 text-sm">Secure user authentication and data privacy storage routing.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full flex justify-center py-10 md:py-0">
              <div className="w-full max-w-md aspect-square rounded-full border-2 border-dashed border-teal-700/50 flex items-center justify-center relative">
                <div className="absolute top-[10%] right-[10%] transform p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white animate-float hover-lift" style={{ animationDelay: '1s' }}>
                  <Database className="w-8 h-8 text-orange-400 mb-2" />
                  <div className="text-sm font-bold tracking-wide">Firebase</div>
                </div>
                <div className="absolute bottom-[10%] left-[10%] transform p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white animate-float hover-lift" style={{ animationDelay: '2s' }}>
                  <Component className="w-8 h-8 text-sky-400 mb-2" />
                  <div className="text-sm font-bold tracking-wide">Next.js</div>
                </div>
                <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white animate-float hover-lift" style={{ animationDelay: '0s' }}>
                  <Server className="w-8 h-8 text-teal-400 mb-2" />
                  <div className="text-sm font-bold tracking-wide">Flask API</div>
                </div>
                
                <div className="w-40 h-40 bg-teal-800/50 rounded-full flex items-center justify-center animate-pulse">
                  <Shield className="w-16 h-16 text-teal-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm bg-white">
        © 2026 MedTrack. Prevent the Prescription Cascade.
      </footer>
    </div>
  );
}
