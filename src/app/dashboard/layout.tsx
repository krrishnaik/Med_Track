import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] flex">
      <Sidebar />
      <TopBar />
      <main className="flex-1 pl-64 pt-20">
        <div className="p-8 max-w-6xl mx-auto animate-[fadeUp_0.8s_ease-out_forwards]">
          {children}
        </div>
      </main>
    </div>
  );
}
