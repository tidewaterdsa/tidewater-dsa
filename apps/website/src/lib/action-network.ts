const AN_URL_SCAN =
  /https?:\/\/(?:www\.)?actionnetwork\.org\/(events|forms)\/[^\s<>"'\])/?#]+/i

const TRAILING_PUNCTUATION = /[.,;:!?)\]'"]+$/

/**
 * Parse an Action Network URL into { type, slug }.
 * Returns null if the input isn't a valid URL, isn't on actionnetwork.org, or isn't in the /events/<slug> or /forms/<slug> shape.
 */
export const extractActionNetworkInfo = (
  url: string
): { type: "event" | "form"; slug: string } | null => {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  if (!parsed.hostname.endsWith("actionnetwork.org")) return null

  const [, section, slug] = parsed.pathname.split("/")
  if (section === "events" && slug) return { type: "event", slug }
  if (section === "forms" && slug) return { type: "form", slug }
  return null
}

export const ensureStylesLoaded = () => {
  if (!document.querySelector("link[data-an-styles]")) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://actionnetwork.org/css/style-embed-whitelabel-v3.css"
    link.setAttribute("data-an-styles", "true")
    document.head.appendChild(link)
  }
}

/** Scan a single string for the first AN URL. */
const extractActionNetworkUrl = (
  text: string | null | undefined
): string | null => {
  if (!text) return null
  const match = text.match(AN_URL_SCAN)
  if (!match) return null
  return match[0].replace(TRAILING_PUNCTUATION, "")
}

/** Find the first AN URL across multiple fields. */
export const findActionNetworkUrl = (
  ...fields: Array<string | null | undefined>
): string | null => {
  for (const field of fields) {
    const url = extractActionNetworkUrl(field)
    if (url) return url
  }
  return null
}
