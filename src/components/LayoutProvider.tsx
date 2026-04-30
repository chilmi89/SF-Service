"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import { useState, useEffect } from "react";

export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Define routes where Navbar/Footer should NOT appear
  const hideLayout = 
    pathname === "/auth/login" || 
    pathname === "/auth/register" || 
    pathname === "/forbidden" || 
    pathname.startsWith("/dashboard") ||
    pathname === "/auth/tenant-register";

  if (!mounted) {
    return <LoadingScreen />;
  }

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
