import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Sidebar />

      <main className="ml-72 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}