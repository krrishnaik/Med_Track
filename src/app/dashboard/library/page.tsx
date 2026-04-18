"use client";

import { Search, Pill, AlertTriangle, ChevronRight, X, Activity } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

const API = 'http://localhost:5000';

export default function DrugLibraryPage() {
  const [lettersData, setLettersData] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [activeLetter, setActiveLetter] = useState<string>("A");

  // Modal state
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [drugDetails, setDrugDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    fetch(`${API}/api/library/index`)
      .then(res => res.json())
      .then(data => {
        setLettersData(data.letters || {});
        setTotalCount(data.total_count || 0);
        if (data.letters) {
          const letters = Object.keys(data.letters).sort();
          setActiveLetter(letters.includes("A") ? "A" : letters[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDrugClick = useCallback((drugName: string) => {
    setSelectedDrug(drugName);
    setDrugDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    fetch(`${API}/api/library/drug/${encodeURIComponent(drugName)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setDrugDetails(data);
        setDetailsLoading(false);
      })
      .catch(e => {
        console.error("Drug details fetch failed:", e);
        setDetailsError("Failed to load interaction data. Please try again.");
        setDetailsLoading(false);
      });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedDrug(null);
    setDrugDetails(null);
    setDetailsError(null);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  const currentDrugs = lettersData[activeLetter] || [];
  const filteredDrugs = search
    ? currentDrugs.filter(d => d.toLowerCase().includes(search.toLowerCase()))
    : currentDrugs;
  const globalFiltered = search
    ? Object.values(lettersData).flat().filter(d => d.toLowerCase().includes(search.toLowerCase())).slice(0, 50)
    : [];

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // ─── Modal rendered via Portal (escapes all parent stacking contexts) ───
  const modalContent = selectedDrug && isMounted ? (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      style={{ zIndex: 99999 }}
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    >
      <div
        className="bg-white rounded-[2rem] w-full max-w-3xl flex flex-col shadow-2xl"
        style={{ height: '85vh', maxHeight: '850px', zIndex: 100000 }}
      >
        {/* Header — always visible, never scrolls away */}
        <div className="shrink-0 px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-[2rem]">
          <div className="flex items-center gap-4 min-w-0">
            <div className="shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-teal-600">
              <Pill className="w-6 h-6" />
            </div>
            <div className="min-w-0 pr-2">
              <h2 className="text-xl font-serif font-bold text-slate-800 truncate">{selectedDrug}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {detailsLoading ? 'Loading...' : drugDetails ? `${drugDetails.interactions?.length ?? 0} of ${drugDetails.total_count ?? 0} interactions shown` : 'Interaction Profile'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {detailsLoading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Activity className="w-10 h-10 animate-pulse mb-4 text-teal-500" />
              <p className="text-lg font-medium">Fetching from global datasets...</p>
              <p className="text-sm mt-1">DDInter · DrugBank · DDI</p>
            </div>
          )}

          {detailsError && !detailsLoading && (
            <div className="flex flex-col items-center justify-center h-full text-rose-400">
              <AlertTriangle className="w-10 h-10 mb-4" />
              <p className="text-lg font-medium">{detailsError}</p>
              <button
                onClick={() => handleDrugClick(selectedDrug)}
                className="mt-4 px-6 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!detailsLoading && !detailsError && drugDetails && (
            drugDetails.interactions?.length > 0 ? (
              <div>
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-3 mb-4 border-b border-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Top {drugDetails.interactions.length} Dangerous Combinations
                    {drugDetails.total_count > drugDetails.interactions.length && (
                      <span className="ml-2 text-slate-400 font-normal normal-case tracking-normal">
                        (of {drugDetails.total_count} total)
                      </span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
                  {drugDetails.interactions.map((int: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white hover:border-teal-300 shadow-sm transition-all group overflow-hidden"
                    >
                      {/* Card header */}
                      <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <span className="font-bold text-slate-700 group-hover:text-teal-700 transition-colors leading-snug text-sm">
                          {int.drug}
                        </span>
                        <span className={clsx(
                          "shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg",
                          int.severity === "Major"    ? "bg-rose-100 text-rose-700" :
                          int.severity === "Moderate" ? "bg-amber-100 text-amber-700" :
                                                        "bg-slate-100 text-slate-600"
                        )}>
                          {int.severity}
                        </span>
                      </div>

                      {/* ⚠️ Consequence — the key callout */}
                      <div className={clsx(
                        "mx-4 mb-3 px-3 py-2 rounded-lg flex items-start gap-2 text-sm font-semibold",
                        int.severity === "Major"    ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        int.severity === "Moderate" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                      "bg-slate-50 text-slate-600 border border-slate-200"
                      )}>
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{int.consequence || "Clinically significant interaction — monitor closely."}</span>
                      </div>

                      {/* Detailed description (if available from DDI_data.json) */}
                      {int.desc && (
                        <div className="px-4 pb-3">
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                            {int.desc}
                          </p>
                        </div>
                      )}

                      {/* Mechanism (if available) */}
                      {int.mechanism && (
                        <div className="px-4 pb-3">
                          <p className="text-[11px] text-slate-400 italic leading-relaxed line-clamp-2">
                            Mechanism: {int.mechanism}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-serif text-slate-700 mb-2">No recorded interactions</h3>
                <p className="text-slate-500 text-sm max-w-sm text-center">
                  {selectedDrug} has no dangerous combination flags in our DDInter, DrugBank or DDI datasets.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-slate-800 mb-2">Clinical Drug Database</h1>
          <p className="text-slate-500 text-lg">
            Browse {totalCount > 0 ? totalCount.toLocaleString() : "all"} indexed drugs from DDInter & DrugBank datasets.
          </p>
        </div>

        {/* Global Search */}
        <div className="relative max-w-2xl mx-auto mb-10 w-full">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across 2,000+ drugs..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-slate-700 text-lg"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center text-slate-400 py-16">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
            Loading dataset — {totalCount || '2000+'} drugs...
          </div>
        )}

        {/* A-Z Rolodex — only shown when not searching */}
        {!loading && !search && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-14 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible shrink-0 pb-2">
              {alphabet.map(alpha => (
                <button
                  key={alpha}
                  onClick={() => { setActiveLetter(alpha); }}
                  disabled={!lettersData[alpha]}
                  className={clsx(
                    "w-10 h-10 shrink-0 rounded-full font-bold text-sm transition-all flex items-center justify-center",
                    activeLetter === alpha
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30 scale-110"
                      : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-slate-100",
                    !lettersData[alpha] && "opacity-20 cursor-not-allowed"
                  )}
                >
                  {alpha}
                </button>
              ))}
            </div>

            {/* Drug list */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-2xl font-serif text-teal-600 font-bold">Index: {activeLetter}</h3>
                <p className="text-sm text-slate-400">{currentDrugs.length.toLocaleString()} drugs</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-3">
                {filteredDrugs.map((drug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDrugClick(drug)}
                    className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 flex items-center justify-between group"
                  >
                    <span className="font-medium text-slate-700 truncate pr-2 group-hover:text-teal-700 transition-colors text-sm">
                      {drug}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                  </button>
                ))}
                {filteredDrugs.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-400">
                    No drugs for "{activeLetter}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global search results */}
        {!loading && search && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-serif text-slate-800 font-bold">Search Results</h3>
              <p className="text-sm text-slate-400">{globalFiltered.length} matches (top 50 shown)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-3">
              {globalFiltered.map((drug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDrugClick(drug)}
                  className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 flex items-center justify-between group"
                >
                  <span className="font-medium text-slate-700 truncate pr-2 group-hover:text-teal-700 transition-colors text-sm">
                    {drug}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                </button>
              ))}
              {globalFiltered.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400">
                  No drugs matching "{search}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal rendered outside main div via Portal — avoids ALL stacking context issues */}
      {isMounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
