/**
 * historyService.ts
 * ─────────────────
 * Fully upgraded to support Firebase Firestore Cloud Sync!
 * Saves instantly to local memory for speed, and backs up to the cloud.
 */

import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

export interface MedCheck {
  id: string;
  timestamp: number;           
  medications: { name: string; dose: string; specialist: string }[];
  severity: string;
  short_analysis: string;
  medium_analysis: string;
  detailed_report: string;
  analyzed_count: number;
  risk_level: 'high' | 'moderate' | 'low' | 'unknown';
  chart_data?: { safety_score: number; risk_score: number; severity_bars: { name: string; percentage: number }[]; combination_comparison?: { label: string; value: number }[] };
}

const STORAGE_KEY = 'medtrack_history';
const EVENT_NAME  = 'medtrack:history-updated';

// ── helpers ──────────────────────────────────────────────────────────────────

function readAll(): MedCheck[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MedCheck[]) : [];
  } catch {
    return [];
  }
}

function writeAll(checks: MedCheck[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

function deriveRiskLevel(severity: string, short_analysis: string): MedCheck['risk_level'] {
  const sev = String(severity || '').toLowerCase();
  if (sev.includes('critical') || sev.includes('high') || sev.includes('major')) return 'high';
  if (sev.includes('moderate')) return 'moderate';
  if (sev.includes('low') || sev.includes('safe') || sev.includes('none')) return 'low';
  
  const text = String(short_analysis || '').toLowerCase();
  if (text.includes('critical') || text.includes('high') || text.includes('major')) return 'high';
  if (text.includes('moderate')) return 'moderate';
  if (text.includes('safe') || text.includes('low')) return 'low';
  
  return 'unknown';
}

// ── FIRESTORE CLOUD SYNC ──────────────────────────────────────────────────────

// Automatically fetch from Firestore when a user logs in!
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, `users/${user.uid}/history`));
        const cloudData = snapshot.docs.map(doc => doc.data() as MedCheck);
        
        // Sort by newest first
        cloudData.sort((a, b) => b.timestamp - a.timestamp);
        
        // Save cloud data to local UI
        writeAll(cloudData);
      } catch (error) {
        console.error("Firebase Sync Error: Did you add the Firestore rules?", error);
      }
    } else {
      // Wipe local storage when logged out
      writeAll([]);
    }
  });
}

// ── public API ────────────────────────────────────────────────────────────────

export function saveCheck(
  medications: { name: string; dose: string; specialist: string }[],
  result: {
    severity: string;
    short_analysis: string;
    medium_analysis: string;
    detailed_report: string;
    analyzed_count: number;
    chart_data?: any;
  }
): MedCheck {
  const check: MedCheck = {
    id: `mc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    medications,
    severity: result.severity || 'Unknown',
    short_analysis: result.short_analysis || '',
    medium_analysis: result.medium_analysis || '',
    detailed_report: result.detailed_report || '',
    analyzed_count: result.analyzed_count || 0,
    risk_level: deriveRiskLevel(result.severity, result.short_analysis),
    chart_data: result.chart_data,
  };

  // 1. Save locally for instant UI update
  const all = readAll();
  all.unshift(check);
  writeAll(all);

  // 2. Backup to Firestore Cloud in the background
  if (auth.currentUser) {
    try {
      const db = getFirestore();
      setDoc(doc(db, `users/${auth.currentUser.uid}/history`, check.id), check);
    } catch (error) {
      console.error("Failed to backup to Firebase:", error);
    }
  }

  return check;
}

export function getChecks(): MedCheck[] {
  return readAll();
}

export function deleteCheck(id: string): void {
  // 1. Delete locally
  writeAll(readAll().filter((c) => c.id !== id));
  
  // 2. Delete from Cloud
  if (auth.currentUser) {
    try {
      const db = getFirestore();
      deleteDoc(doc(db, `users/${auth.currentUser.uid}/history`, id));
    } catch (error) {
      console.error("Failed to delete from Firebase:", error);
    }
  }
}

export function clearHistory(): void {
  writeAll([]);
}

export function subscribeToHistory(callback: (checks: MedCheck[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(readAll());
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export function getStats() {
  const checks = readAll();
  const alertChecks   = checks.filter((c) => c.risk_level === 'high');
  const safeChecks    = checks.filter((c) => c.risk_level === 'low');
  const totalDrugs    = checks.reduce((acc, c) => acc + (c.analyzed_count || 0), 0);
  
  return {
    total:   checks.length,
    alerts:  alertChecks.length,
    safe:    safeChecks.length,
    drugs:   totalDrugs,
  };
}