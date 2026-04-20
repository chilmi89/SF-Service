import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

logger.sentry("Memulai inisialisasi pada client...", "info");

Sentry.init({
  // Hardcode DSN untuk memastikan koneksi berhasil
  dsn: "https://ba6aaa84dd7648abf55018d841fd899d@o4511249908039680.ingest.us.sentry.io/4511249912561664",

  integrations: [
    Sentry.replayIntegration(),
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1.0,

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to false will stop the flood of internal logs
  debug: false,
  enableLogs: true,
});

logger.sentry("Inisialisasi client selesai.", "success");
