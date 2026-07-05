"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] flex overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <TopBar isCollapsed={isCollapsed} />
      <main 
        className={`flex-1 pt-[72px] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'pl-[88px]' : 'pl-[280px]'
        }`}
      >
        <div 
          className="p-8 max-w-[1200px] mx-auto" 
          style={{ opacity: 0, animation: 'fadeIn 0.3s ease-out forwards' }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
