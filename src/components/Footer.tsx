"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-black/[0.05] bg-transparent py-8 px-8 sm:px-16 relative z-10">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
        {/* Brand & Copyright */}
        <div className="flex items-center gap-2.5">
          <img
            src="/images/logo-icon.png"
            alt="FixIt Logo"
            className="h-6 w-6 object-contain"
          />
          <span className="font-black text-black tracking-tight text-xs">FixIt</span>
          <span className="text-gray-300">|</span>
          <p className="text-[11px] font-medium text-gray-400">
            &copy; {currentYear} FixIt. All rights reserved.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-gray-500 font-bold">
          <Link href="/home" className="hover:text-black transition-colors">Home</Link>
          <Link href="/about" className="hover:text-black transition-colors">About</Link>
          <Link href="/partners" className="hover:text-black transition-colors">Partners</Link>
          <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
