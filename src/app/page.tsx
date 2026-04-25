import Link from 'next/link';
import { Shield, ArrowRight, Activity, Database, Server, Component } from 'lucide-react';
import { MedTrackLogo } from '@/components/dashboard/Sidebar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] overflow-hidden font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-brand-cream)]/90 backdrop-blur-md border-b border-slate-200/40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover-lift">
            <MedTrackLogo />
            <span className="font-serif text-2xl text-[var(--color-brand-teal-dark)]">MedTrack</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/login" className="text-slate-600 hover:text-[var(--color-brand-teal)] font-medium transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-6 py-2.5 rounded-full bg-[var(--color-brand-teal)] text-white font-medium hover:bg-[var(--color-brand-teal-dark)] transition-colors hover-lift shadow-md shadow-teal-900/20">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 animate-[fadeUp_0.8s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F4F8] text-[var(--color-brand-teal-dark)] text-sm font-semibold tracking-wide hover-lift">
            <Shield className="w-4 h-4" />
            <span>AI-Powered Safety</span>
          </div>
          <h1 className="text-6xl md:text-[5.5rem] leading-[1.05] tracking-tight font-serif text-slate-900">
            Stop the <br/>
            <span className="text-[var(--color-brand-teal)]">Prescription</span><br/>
            <span className="text-[var(--color-brand-teal)]">Cascade.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
            Don't let medication side effects be mistaken for new medical conditions. Run comprehensive checks to see how your drugs interact safely.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Link href="/signup" className="px-8 py-4 rounded-full bg-[var(--color-brand-teal)] text-white font-medium text-lg hover:bg-[var(--color-brand-teal-dark)] transition-all hover-lift shadow-xl shadow-teal-900/20 flex items-center gap-2">
              Start Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="flex-1 relative w-full h-[500px] flex items-center justify-center">
          {/* Abstract floating background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-brand-teal)]/10 rounded-full blur-[100px] animate-float pointer-events-none"></div>

          {/* Floating Glassmorphic Drug Cards */}
          <div className="relative w-full max-w-lg h-full">
            {/* Top Right Card */}
            <div className="absolute top-[10%] right-[5%] w-[280px] p-4 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-xl shadow-slate-200/50 animate-float hover-lift z-10" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-slate-800 font-bold">Lisinopril</h3>
                  <p className="text-sm text-slate-500">10mg • Daily</p>
                </div>
              </div>
              <div className="text-sm text-rose-600 font-medium bg-rose-50/50 p-2.5 rounded-xl flex items-center gap-2">
                <span className="text-rose-500">⚠️</span> Potential interaction detected
              </div>
            </div>

            {/* Center Left Card */}
            <div className="absolute top-[40%] left-[0%] w-[320px] p-5 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 animate-float border border-slate-100 z-20 hover-lift" style={{ animationDelay: '1.5s' }}>
               <div className="flex items-center gap-5 mb-5">
                <div className="w-14 h-14 rounded-full bg-[var(--color-brand-teal-dark)] text-white flex items-center justify-center shadow-lg shadow-teal-900/20">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-slate-800 font-bold">Safety Check</h3>
                  <p className="text-base text-slate-500">Analyzing cascade...</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-[var(--color-brand-teal-dark)] h-full rounded-full w-[75%] transition-all duration-1000"></div>
              </div>
            </div>

            {/* Bottom Right Card */}
            <div className="absolute bottom-[10%] right-[10%] w-[260px] p-4 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-xl shadow-slate-200/50 animate-float hover-lift z-10" style={{ animationDelay: '2.5s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-slate-800 font-bold">Amlodipine</h3>
                  <p className="text-sm text-slate-500">5mg • Daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Problem Grid */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 animate-[fadeUp_0.6s_ease-out_forwards]">
            <h2 className="text-5xl md:text-6xl text-slate-900 mb-6 font-serif tracking-tight">Understanding the Problem</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">How the prescription cascade silently creates new health problems.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[ 
              { step: '01', title: 'Drug Causes Side Effect', desc: 'A newly prescribed medication causes an unintended but common side effect.' },
              { step: '02', title: 'Mistaken for Config', desc: 'The side effect is misdiagnosed as a new, separate medical condition.' },
              { step: '03', title: 'Another Drug Prescribed', desc: 'A secondary drug is added to treat the condition, compounding toxicity.' }
            ].map((item, i) => (
              <div key={i} className="bg-[var(--color-brand-cream)] p-10 rounded-[2.5rem] hover-lift transition-all duration-300">
                <div className="text-6xl font-serif text-[var(--color-brand-teal)]/30 mb-8">{item.step}</div>
                <h3 className="text-2xl font-serif text-slate-900 mb-4 tracking-tight leading-snug">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Architecture Section */}
      <section className="py-32 bg-[#1A464C] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--color-brand-teal)] rounded-full blur-[150px] opacity-20 animate-float pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 text-left">
              <h2 className="text-5xl md:text-6xl mb-8 font-serif tracking-tight">Robust Architecture</h2>
              <p className="text-teal-50 text-xl mb-12 leading-relaxed max-w-lg opacity-90">
                MedTrack is powered by an architecture separating heavy analytical logic from the fast, interactive user interface.
              </p>
              <ul className="space-y-8 max-w-md">
                <li className="flex items-start gap-5 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-teal-900/60 flex items-center justify-center shrink-0 border border-teal-700/50 group-hover:bg-[var(--color-brand-teal)] transition-colors duration-300">
                    <Component className="w-7 h-7 text-teal-100" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif mb-2 text-white group-hover:text-teal-100 transition-colors">React / Next.js</h4>
                    <p className="text-teal-100/70 text-base leading-relaxed">Blazing fast UI with beautiful anti-gravity styling and seamless interactions.</p>
                  </div>
                </li>
                <li className="flex items-start gap-5 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-teal-900/60 flex items-center justify-center shrink-0 border border-teal-700/50 group-hover:bg-[var(--color-brand-teal)] transition-colors duration-300">
                    <Server className="w-7 h-7 text-teal-100" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif mb-2 text-white group-hover:text-teal-100 transition-colors">Flask Python Engine</h4>
                    <p className="text-teal-100/70 text-base leading-relaxed">Heavy lifting for drug normalization and cascade pathway analysis.</p>
                  </div>
                </li>
                <li className="flex items-start gap-5 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-teal-900/60 flex items-center justify-center shrink-0 border border-teal-700/50 group-hover:bg-[var(--color-brand-teal)] transition-colors duration-300">
                    <Database className="w-7 h-7 text-teal-100" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif mb-2 text-white group-hover:text-teal-100 transition-colors">Firebase Identity</h4>
                    <p className="text-teal-100/70 text-base leading-relaxed">Secure user authentication and data privacy storage routing.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full flex justify-center py-10 md:py-0">
              <div className="w-full max-w-lg aspect-square rounded-full border border-teal-600/30 flex items-center justify-center relative">
                {/* Dotted outer ring */}
                <div className="absolute inset-[-40px] rounded-full border border-dashed border-teal-600/30 animate-[spin_60s_linear_infinite]"></div>

                <div className="absolute top-[5%] right-[15%] transform p-6 bg-[#3D6A70] rounded-[1.5rem] text-white animate-float shadow-xl shadow-black/20" style={{ animationDelay: '1s' }}>
                  <Server className="w-8 h-8 text-teal-200 mb-2" />
                  <div className="text-sm font-bold tracking-wide">Flask API</div>
                </div>
                <div className="absolute top-[35%] right-[-5%] transform p-6 bg-[#3D6A70] rounded-[1.5rem] text-white animate-float shadow-xl shadow-black/20" style={{ animationDelay: '2s' }}>
                  <Database className="w-8 h-8 text-orange-300 mb-2" />
                  <div className="text-sm font-bold tracking-wide">Firebase</div>
                </div>
                <div className="absolute bottom-[15%] left-[10%] transform p-6 bg-[#3D6A70] rounded-[1.5rem] text-white animate-float shadow-xl shadow-black/20" style={{ animationDelay: '0s' }}>
                  <Component className="w-8 h-8 text-sky-300 mb-2" />
                  <div className="text-sm font-bold tracking-wide">Next.js</div>
                </div>
                
                <div className="w-48 h-48 bg-[#113A40] rounded-full flex items-center justify-center shadow-2xl shadow-black/30">
                  <Shield className="w-20 h-20 text-[var(--color-brand-teal)] drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm bg-white font-medium">
        © 2026 MedTrack. Prevent the Prescription Cascade.
      </footer>
    </div>
  );
}
