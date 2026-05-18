import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SF-Service",
  description: "SF-Service System Documentation",
};

import SentryInit from "@/components/SentryInit";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body
        className={`${jakarta.className} antialiased`}
      >
        <SentryInit />
        {children}
      </body>
    </html>
  );
}
