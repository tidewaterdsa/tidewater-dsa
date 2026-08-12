import type { ErrorClassifier } from "@/components/feedback/InlineError"

export const classifyEventError: ErrorClassifier = (raw) => {
  const lower = raw.toLowerCase()

  if (
    lower.includes("google_calendar_id") &&
    lower.includes("must be set in production")
  ) {
    return {
      headline: "Calendar isn't set up yet",
      explanation:
        "A site admin still needs to wire up Google Calendar. If you're an admin, set GOOGLE_CALENDAR_ID and GOOGLE_CALENDAR_API_KEY in your Cloudflare environment variables.",
    }
  }

  if (lower.includes("google calendar api 401")) {
    return {
      headline: "We couldn't read the calendar",
      explanation:
        "The Google Calendar API key isn't valid or has been revoked.",
    }
  }

  if (lower.includes("google calendar api 403")) {
    return {
      headline: "We couldn't read the calendar",
      explanation:
        "Google refused access to the calendar.",
    }
  }

  if (lower.includes("google calendar api 404")) {
    return {
      headline: "Calendar not found",
      explanation:
        "Google couldn't find a calendar at the configured ID.",
    }
  }

  if (lower.includes("google calendar api 429")) {
    return {
      headline: "Temporarily unavailable",
      explanation:
        "Google is rate-limiting us. Please try again in a minute. This usually resolves on its own.",
    }
  }

  if (lower.includes("google calendar api 5")) {
    return {
      headline: "Google Calendar is having trouble",
      explanation:
        "Google's servers returned an error. Try refreshing in a minute.",
    }
  }

  return {
    headline: "We couldn't load the events right now",
    explanation:
      "Please try refreshing the page in a few minutes. If it keeps happening, let a site admin know.",
  }
}
