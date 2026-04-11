"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-black/20 bg-gray-50/50 px-6 py-4 relative z-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Brand & Copyright */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-black text-black">FixIt</h4>
            <p className="mt-2 text-xs font-bold uppercase tracking-tight text-[#a1a1a1]">
              © 2024 FIXIT NEVERDIE. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Simple Links */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-medium uppercase tracking-widest text-[#a1a1a1] md:gap-10">
            <Link href="#" className="hover:text-black transition-colors">Platform</Link>
            <Link href="#" className="hover:text-black transition-colors">Network</Link>
            <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-black transition-colors">Terms</Link>
            <Link href="#" className="hover:text-black transition-colors">Cookies</Link>
            <Link href="#" className="hover:text-black transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
