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
      <main className="flex-1 pl-[280px] pt-[72px]">
        <div className="p-8 max-w-[1200px] mx-auto animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
