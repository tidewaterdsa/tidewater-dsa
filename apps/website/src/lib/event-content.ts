/**
 * Normalizers for the raw content Google Calendar hands back, applied once at the
 * boundary in `events.ts` so every consumer gets display-ready strings.
 */

/** Matches an absolute http(s) URL, stopping before markup and quote characters. */
export const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/

const URL_PATTERN_GLOBAL = new RegExp(URL_PATTERN.source, "g")

/** Punctuation that reads as sentence punctuation rather than part of a URL. */
const TRAILING_PUNCTUATION = /[.,;:!?]+$/

/**
 * A bare label organizers leave stranded once the URL beside it is removed
 * ("RSVP: <link>" → "RSVP:").
 */
const STRANDED_LABEL =
  /^\s*(rsvp|register|registration|sign\s*up|link|url)\s*:?\s*$/i

/**
 * gcal rewrites every link in a description to point at Google's redirector
 * (`https://www.google.com/url?q=<target>&sa=D&source=calendar&ust=...`). Recover the
 * real target so links we surface don't route through an extra tracking hop.
 */
const unwrapGoogleRedirect = (href: string): string => {
  if (!/^https?:\/\/(?:www\.)?google\.com\/url\?/i.test(href)) return href

  try {
    const target = new URL(href).searchParams.get("q")
    return target || href
  } catch {
    return href
  }
}

/**
 * Decode the character entities gcal emits. Ampersand is decoded last so that an
 * escaped entity (`&amp;lt;`) decodes to the literal text `&lt;` rather than `<`.
 */
const decodeEntities = (text: string): string =>
  text
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&(?:apos|#0*39);/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/gi, "&")

/**
 * Replace an anchor with readable text. When the link text is already the URL — the
 * common case, since gcal autolinks pasted URLs — emit it once rather than
 * "https://… (https://…)".
 */
const flattenAnchors = (html: string): string =>
  html.replace(
    /<a\b[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, rawHref: string, inner: string) => {
      const href = unwrapGoogleRedirect(decodeEntities(rawHref).trim())
      const text = decodeEntities(inner.replace(/<[^>]*>/g, "")).trim()

      if (!href) return text
      if (!text) return href
      // Link text is the URL itself, or already contains it — no point repeating it.
      if (URL_PATTERN.test(text) || text.includes(href)) return text

      return `${text} (${href})`
    }
  )

/**
 * Convert a Google Calendar HTML description into clean plain text, preserving
 * paragraph and line breaks as newlines (callers render with `whitespace-pre-line`).
 */
export const htmlToPlainText = (html: string): string => {
  const flattened = flattenAnchors(html)

  const withBreaks = flattened
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|tr)>/gi, "\n\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")

  // Entities are decoded after tag stripping so a decoded "<" is never mistaken for a tag.
  const text = decodeEntities(withBreaks.replace(/<[^>]*>/g, ""))

  return (
    text
      // gcal peppers descriptions with literal non-breaking and zero-width spaces.
      .replace(/[\u00A0\u200B]/g, " ")
      .replace(/\r\n?/g, "\n")
      // Trailing spaces on a line are invisible but defeat the blank-line collapse below.
      .replace(/[ \t]+$/gm, "")
      .replace(/[ \t]{2,}/g, " ")
      // Rich-text editors leave runs of empty paragraphs behind; cap at one blank line.
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}

/**
 * Return a location only when it names a place. 
 * When a location holds both an address and a link, keep the address and drop the link.
 */
export const normalizeEventLocation = (
  location: string | null | undefined
): string | null => {
  if (!location) return null

  const decoded = decodeEntities(location)
    .replace(/\u00A0/g, " ")
    .trim()
  if (!decoded) return null
  if (!URL_PATTERN.test(decoded)) return decoded

  const withoutUrls = decoded
    .replace(URL_PATTERN_GLOBAL, " ")
    // Separators orphaned by the removed URL.
    .replace(/[\s]*[,;|·–—]+[\s]*$/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim()

  if (!withoutUrls || STRANDED_LABEL.test(withoutUrls)) return null

  return withoutUrls.replace(TRAILING_PUNCTUATION, "").trim() || null
}
