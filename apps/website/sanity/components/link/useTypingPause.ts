import { useEffect, useMemo, useState } from "react"

/** How long a half-typed value gets before anything weighs in on it. */
const TYPING_PAUSE_MS = 600

export interface TypingPause {
  /** False from the first keystroke until the typing stops for a moment. */
  paused: boolean
  /** Skip the wait, for an edit that's clearly finished. */
  flush: (value: string) => void
}

/**
 * Tracks whether `value` has sat still long enough to comment on. It starts out
 * paused, so a value that arrives with the form is judged straight away rather
 * than a beat later.
 *
 * `flush` takes the value it's settling because the caller often knows what's
 * about to arrive (a correction it just applied) before the prop catches up.
 */
export const useTypingPause = (value: string): TypingPause => {
  const [settled, setSettled] = useState(value)
  const [flushed, setFlushed] = useState<string | null>(null)

  // A flushed value counts as paused this render; the timer catches state up.
  const paused = settled === value || flushed === value

  useEffect(() => {
    if (settled === value) return

    const timer = setTimeout(
      () => setSettled(value),
      flushed === value ? 0 : TYPING_PAUSE_MS
    )
    return () => clearTimeout(timer)
  }, [value, settled, flushed])

  return useMemo(() => ({ paused, flush: setFlushed }), [paused])
}
