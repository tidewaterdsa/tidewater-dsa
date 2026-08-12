import { useCallback, useEffect, useState } from "react"

/**
 * Generic URL-synced state hook.
 *
 * On first render, hydrates state from the URL via `parse`. On every state
 * change, serializes back via `serialize` and calls `history.replaceState`
 * so shareable URLs stay current without polluting browser history.
 *
 * SSR-safe: during server render `window` is undefined and the initializer
 * falls back to the provided `initial` value. The first client render reads
 * `window.location` synchronously via `useState`'s lazy initializer — that
 * avoids the React 19 anti-pattern of calling `setState` from inside a
 * `useEffect`.
 *
 * Used by both the calendar (event-filters.ts) and the resources page
 * (resource-filters.ts) to sync filter state to the URL.
 */
export const useUrlFilterState = <T>(
  initial: T,
  parse: (params: URLSearchParams) => T,
  serialize: (state: T) => URLSearchParams,
  /** URL keys this hook owns. They get cleared on every write so unchecking
   * a filter actually removes it from the URL. Other keys are left alone. */
  filterKeys: readonly string[]
): [T, (next: T) => void] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial
    return parse(new URLSearchParams(window.location.search))
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)

    // Clear every key this hook owns, then re-write the current state.
    for (const key of filterKeys) params.delete(key)
    serialize(state).forEach((value, key) => params.set(key, value))

    const qs = params.toString()
    const newUrl = `${window.location.pathname}${
      qs ? `?${qs}` : ""
    }${window.location.hash}`
    window.history.replaceState(null, "", newUrl)
  }, [state, serialize, filterKeys])

  const update = useCallback((next: T) => setState(next), [])
  return [state, update]
}
