import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Sidebar />

      <div className="ml-72">
    {/* <Topbar /> */}

    <main className="p-8">
     <div className="max-w-5xl mx-auto">
    {children}
  </div>
    </main>
  </div>
    </div>
  );
}