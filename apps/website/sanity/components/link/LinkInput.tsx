import { useCallback, useMemo, useRef, useState } from "react"
import { set, type StringInputProps } from "sanity"
import { Stack } from "@sanity/ui"
import { analyzeHref } from "./linkHref"
import { AutoFixNotice, HrefNotice } from "./LinkNotice"
import { usePageSlugs } from "./usePageSlugs"
import { useTypingPause } from "./useTypingPause"

interface LinkInputProps extends StringInputProps {
  /** Fields that can only ever point off-site (social profiles, RSVP links). */
  externalOnly?: boolean
}

/**
 * Link field that keeps scheme-less values from silently becoming internal
 * paths: a pasted host gets `https://` on blur, anything less obvious gets a
 * banner spelling out how the value will be treated.
 */
export const LinkInput = (props: LinkInputProps) => {
  const { externalOnly = false, value, onChange } = props

  const pageSlugs = usePageSlugs()
  const [autoFix, setAutoFix] = useState<{ from: string; to: string } | null>(
    null
  )

  // Set when the admin undoes a fix, so blurring the field again leaves their
  // value alone and shows the banner instead.
  const keepAsTypedRef = useRef<string | null>(null)

  const trimmed = (value ?? "").trim()

  // Nothing is said mid-keystroke, so "/get-involve" isn't scolded on its way
  // to "/get-involved".
  const { paused, flush } = useTypingPause(trimmed)

  const analysis = useMemo(
    () => analyzeHref(trimmed, pageSlugs),
    [trimmed, pageSlugs]
  )

  const applyHref = useCallback(
    (next: string) => {
      setAutoFix(null)
      flush(next)
      onChange(set(next))
    },
    [flush, onChange]
  )

  // Caught on the wrapper rather than the input itself: the default input owns
  // its own element props, including a ref we shouldn't reach through.
  const handleBlur = useCallback(() => {
    const fixable =
      analysis.kind === "needs-scheme" && keepAsTypedRef.current !== trimmed

    if (fixable) {
      onChange(set(analysis.suggestion))
      setAutoFix({ from: trimmed, to: analysis.suggestion })
      flush(analysis.suggestion)
      return
    }

    // Leaving the field is as done as the admin gets, so stop waiting on them.
    flush(trimmed)
  }, [analysis, flush, onChange, trimmed])

  const handleUndo = useCallback(() => {
    if (!autoFix) return
    keepAsTypedRef.current = autoFix.from
    applyHref(autoFix.from)
  }, [applyHref, autoFix])

  // The fix notice only stands while the value is still what we wrote.
  const showAutoFix = autoFix?.to === trimmed

  return (
    <Stack space={2} onBlur={handleBlur}>
      {props.renderDefault(props)}
      {paused &&
        (showAutoFix ? (
          <AutoFixNotice onUndo={handleUndo} />
        ) : (
          <HrefNotice
            analysis={analysis}
            externalOnly={externalOnly}
            onApply={applyHref}
          />
        ))}
    </Stack>
  )
}

/** Same field, but internal paths are never the right answer. */
export const ExternalLinkInput = (props: StringInputProps) => (
  <LinkInput {...props} externalOnly />
)
