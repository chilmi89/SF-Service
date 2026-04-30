'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { motion } from 'framer-motion';

// SwaggerUI needs to be client-rendered
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  )
});

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a consistent loading state during hydration to avoid mismatches
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main suppressHydrationWarning className="min-h-screen bg-slate-50 transition-colors duration-300 relative">
      {/* Decorative Background Elements (Lighter) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-200/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[50%] bg-blue-100/10 blur-[100px] rounded-full" />
      </div>

      {/* Custom Styles for Maximum Legibility */}
      <style jsx global>{`
        .swagger-ui .info { margin: 24px 0 !important; }
        .swagger-ui .info .title { color: #0284c7 !important; font-family: var(--font-outfit), sans-serif !important; font-weight: 800 !important; font-size: 2.25rem !important; }
        .swagger-ui .info p, .swagger-ui .info li { color: #334155 !important; font-size: 1rem !important; }
        .swagger-ui .scheme-container { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .swagger-ui .opblock { border-radius: 12px !important; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important; border: 1px solid #e2e8f0 !important; background: white !important; overflow: hidden !important; }
        .swagger-ui .opblock.opblock-post { border-color: #7dd3fc !important; }
        .swagger-ui .opblock.opblock-get { border-color: #bae6fd !important; }
        .swagger-ui .opblock-summary { background: white !important; padding: 12px 20px !important; }
        .swagger-ui .opblock-summary-description { color: #475569 !important; font-weight: 500 !important; }
        .swagger-ui .btn.authorize { color: #0284c7 !important; border-color: #0284c7 !important; border-radius: 8px !important; transition: all 0.2s !important; }
        .swagger-ui .btn.authorize:hover { background: #0284c7 !important; color: white !important; }
        .swagger-ui .btn.authorize svg { fill: #0284c7 !important; }
        .swagger-ui .btn.authorize:hover svg { fill: white !important; }
        .swagger-ui section.models h4 { color: #0f172a !important; }
        .swagger-ui .model-title { color: #0f172a !important; }
      `}</style>

      {/* Header Section */}
      <section className="relative pt-24 pb-12">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Technical API Reference
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Full API <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700">Exploration</span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
              Mulai integrasi Anda dengan cepat menggunakan dokumentasi interaktif kami. 
              Semua endpoint telah teruji dan siap digunakan.
            </p>

            <div className="flex justify-center gap-4">
               <a 
                href="/"
                className="inline-flex items-center px-8 py-3.5 rounded-2xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-xl hover:shadow-sky-200"
              >
                Back to Dashboard
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Swagger UI Container */}
      <section className="container mx-auto px-4 lg:px-12 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] p-4 md:p-10"
        >
          <SwaggerUI 
          url="/api/swagger" 
          defaultModelsExpandDepth={-1}
        />
        </motion.div>
      </section>

      {/* Footer Decoration */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <p suppressHydrationWarning className="text-sm text-slate-500">
           &copy; {new Date().getFullYear()} SF-Service. Handcrafted for performance.
        </p>
      </footer>
    </main>
  );
}

