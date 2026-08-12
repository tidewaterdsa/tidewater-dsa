import type { ErrorClassifier } from "@/components/feedback/InlineError"

export const classifyResourceError: ErrorClassifier = (raw) => {
  const lower = raw.toLowerCase()

  if (lower.includes("no google sheet configured")) {
    return {
      headline: "Resources directory isn't set up yet",
      explanation:
        "A site admin still needs to point this page at a Google Sheet. If you're an admin, open Sanity Studio → Resources Page → Data Source and enter the Sheet ID.",
    }
  }

  if (lower.includes("no google sheets api key")) {
    return {
      headline: "Resources directory is missing credentials",
      explanation: "The Google Sheets API key isn't set.",
    }
  }

  if (lower.includes("unable to parse range")) {
    return {
      headline: "We couldn't read the resources sheet",
      explanation:
        "The sheet range in Sanity doesn't match what Google Sheets expects.",
    }
  }

  if (lower.includes("sheets api 403")) {
    return {
      headline: "We couldn't read the resources sheet",
      explanation: "Google refused access to the sheet.",
    }
  }

  if (lower.includes("sheets api 404")) {
    return {
      headline: "Resources sheet not found",
      explanation: "Google couldn't find the sheet at the configured ID.",
    }
  }

  if (lower.includes("sheets api 429")) {
    return {
      headline: "Temporarily unavailable",
      explanation:
        "Google is rate-limiting us. Please try again in a minute. This usually resolves on its own.",
    }
  }

  if (lower.includes("sheets api 5")) {
    return {
      headline: "Google Sheets is having trouble",
      explanation:
        "Google's servers returned an error. Try refreshing in a minute.",
    }
  }

  return {
    headline: "We couldn't load the community resources right now",
    explanation:
      "Please try refreshing the page in a few minutes. If it keeps happening, let a site admin know.",
  }
}
