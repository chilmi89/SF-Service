'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryInit() {
  useEffect(() => {
    // Pastikan Sentry hanya diinisialisasi sekali pada client
    if (!Sentry.getClient()) {
      console.log("[Sentry] Memulai inisialisasi manual pada client (Turbopack support)...");
      Sentry.init({
        dsn: "https://ba6aaa84dd7648abf55018d841fd899d@o4511249908039680.ingest.us.sentry.io/4511249912561664",
        integrations: [
          Sentry.replayIntegration(),
          Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        debug: true,
      });
      console.log("[Sentry] Inisialisasi manual selesai.");
    }
  }, []);

  return null;
}
