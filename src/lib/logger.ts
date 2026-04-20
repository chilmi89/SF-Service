const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const icons = {
  success: "✓",
  warn: "⚠",
  error: "✘",
  info: "ℹ",
  sentry: "⌬",
};

export const logger = {
  success: (message: string, context = "SUCCESS") => {
    console.log(
      `${colors.green}${colors.bright}${icons.success} [${context}]${colors.reset} ${message}`
    );
  },

  warn: (message: string, context = "WARNING") => {
    console.warn(
      `${colors.yellow}${colors.bright}${icons.warn} [${context}]${colors.reset} ${message}`
    );
  },

  error: (message: string, context = "ERROR") => {
    console.error(
      `${colors.red}${colors.bright}${icons.error} [${context}]${colors.reset} ${message}`
    );
  },

  info: (message: string, context = "INFO") => {
    console.log(
      `${colors.cyan}${colors.bright}${icons.info} [${context}]${colors.reset} ${message}`
    );
  },

  sentry: (message: string, status: "success" | "warn" | "error" | "info" = "info") => {
    const color = status === "success" ? colors.green : status === "error" ? colors.red : status === "warn" ? colors.yellow : colors.cyan;
    const icon = status === "success" ? icons.success : status === "error" ? icons.error : status === "warn" ? icons.warn : icons.sentry;
    
    console.log(
      `${color}${colors.bright}${icon} [Sentry]${colors.reset} ${message}`
    );
  }
};
