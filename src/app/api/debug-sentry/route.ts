import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  console.log("Triggering Sentry server-side message...");
  const eventId = Sentry.captureMessage("Sentry Test Message from API Route");
  console.log("Message captured with eventId:", eventId);

  // Also trigger an error
  try {
    throw new Error("Sentry Test Error from API Route");
  } catch (error) {
    Sentry.captureException(error);
    console.log("Exception captured");
  }

  return NextResponse.json({ 
    message: "Sentry test events triggered",
    eventId 
  });
}
