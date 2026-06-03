"use client";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Circle Spinner - Pure CSS for Instant Rendering */}
        <div className="relative h-16 w-16">
          {/* Static Background Circle */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

          {/* Animated Spinning Border (CSS Keyframes) */}
          <div
            className="absolute inset-0 rounded-full border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent animate-spin"
            style={{ animationDuration: "0.8s" }}
          />
        </div>

        {/* Minimal Text with CSS Pulse */}
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-black animate-pulse">
          Loading
        </p>
      </div>

      {/* Subtle bottom decoration */}
      <div className="absolute bottom-12">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 opacity-0 animate-in fade-in duration-1000 fill-mode-forwards">
          FixIt Security Protocol
        </div>
      </div>
    </div>
  );
}
