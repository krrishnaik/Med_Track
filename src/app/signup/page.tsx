"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Pill } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError('');
    setLoading(true);

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Add their display name to their profile
      await updateProfile(user, {
        displayName: name || 'User'
      });

      // 3. Create a user document in Firestore so their profile exists in DB
      try {
        const db = getFirestore();
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name || 'User',
          email: email,
          createdAt: new Date().toISOString()
        });
      } catch (dbError) {
        console.error("Failed to create Firestore user document:", dbError);
      }

      console.log("Success! User created:", user.uid);
      
      // 3. Redirect to the dashboard
      window.location.href = '/dashboard';

    } catch (err: any) {
      console.error("Firebase Sign-Up Error:", err);
      // Clean up common Firebase error messages for the UI
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to create an account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-teal-200/40 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }}></div>

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-teal-900/10 border border-white/50 relative z-10 animate-[fadeUp_0.8s_ease-out_forwards]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-brand-teal)] text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] flex items-center justify-center relative saturate-150 mx-auto mb-4 hover-lift">
            <Pill className="w-7 h-7 absolute opacity-90" />
          </div>
          <h1 className="text-3xl font-serif text-slate-800 mb-2">Create Account</h1>
          <p className="text-slate-500">Join MedTrack and prevent medication risks.</p>
        </div>

        {/* Show error messages if Firebase rejects the signup */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm text-center font-medium animate-[fadeUp_0.3s_ease-out_forwards]">
            {error}
          </div>
        )}

        {/* Attached the handleSignUp function to the form */}
        <form onSubmit={handleSignUp} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:border-[var(--color-brand-teal)] transition-all bg-white/50" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:border-[var(--color-brand-teal)] transition-all bg-white/50" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/50 focus:border-[var(--color-brand-teal)] transition-all bg-white/50" 
            />
          </div>
          
          {/* Changed from <Link> to a <button> so it submits the form */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[var(--color-brand-teal)] text-white font-medium text-lg hover:bg-[var(--color-brand-teal-dark)] transition-all hover-lift shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : (
              <>Sign Up <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-[var(--color-brand-teal)] font-medium hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}