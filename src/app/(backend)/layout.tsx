import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-screen">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r p-4">Sidebar</aside>
      <div className="flex-1 flex flex-col">
        {/* Topbar Placeholder */}
        <header className="h-16 border-b p-4">Dashboard Topbar</header>
        <main className="p-6">{children}</main>
      </div>
    </section>
  );
}
