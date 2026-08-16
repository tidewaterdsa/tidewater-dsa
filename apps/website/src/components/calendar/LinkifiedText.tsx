import { Fragment, type ReactElement } from "react"
import { URL_PATTERN } from "@/lib/event-content"

const URL_PATTERN_GLOBAL = new RegExp(URL_PATTERN.source, "g")

/** Sentence punctuation that follows a URL rather than belonging to it. */
const TRAILING_PUNCTUATION = /[.,;:!?]+$/

/**
 * Render plain text with bare URLs turned into links.
 *
 * Google Calendar descriptions arrive as HTML and are flattened to plain text in
 * `event-content.ts`, which leaves any links as bare URLs. Re-linking them here keeps
 * them clickable without handing calendar-authored markup to `dangerouslySetInnerHTML`
 * — anyone with write access to the chapter calendar would otherwise be injecting HTML
 * into the site.
 */
export const LinkifiedText = ({ text }: { text: string }): ReactElement => {
  const parts: Array<string | { href: string; label: string }> = []
  let cursor = 0

  for (const match of text.matchAll(URL_PATTERN_GLOBAL)) {
    const raw = match[0]
    const start = match.index

    // Keep sentence punctuation as text so "see https://x.com." doesn't link the period.
    const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? ""
    const href = trailing ? raw.slice(0, -trailing.length) : raw

    if (start > cursor) parts.push(text.slice(cursor, start))
    parts.push({ href, label: href })
    if (trailing) parts.push(trailing)

    cursor = start + raw.length
  }

  if (cursor < text.length) parts.push(text.slice(cursor))

  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <a
            key={i}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-link-soft break-all underline underline-offset-2"
          >
            {part.label}
          </a>
        )
      )}
    </>
  )
}
