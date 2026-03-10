import React from 'react';

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Navbar Placeholder */}
      <nav className="p-4 border-b">Frontend Navbar</nav>
      <main>{children}</main>
      {/* Footer Placeholder */}
      <footer className="p-4 border-t">Frontend Footer</footer>
    </section>
  );
}
