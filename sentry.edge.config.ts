import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

logger.sentry("Memulai inisialisasi pada edge...", "info");

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to false will stop the flood of internal logs
  debug: false,
  enableLogs: true,
});

logger.sentry("Inisialisasi edge selesai.", "success");
