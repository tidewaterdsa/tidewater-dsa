import { useEffect, useState } from "react"
import type { ComponentType } from "react"
import { FolderIcon } from "@sanity/icons"
import { useDocumentStore } from "sanity"
import { combineLatest } from "rxjs"
import { DSA_RED } from "../../theme"
import { hasContentChanges } from "./hasContentChanges"

export interface StatusTarget {
  documentId: string
  documentType: string
}

/**
 * True when any of the documents holds edits the website hasn't been given yet.
 *
 * Goes through the document store rather than useEditState so a folder row can
 * watch a whole list of documents in one subscription. The store memoises per
 * document pair, so rows watching the same document share a connection.
 */
const useAnyUnpublished = (targets: readonly StatusTarget[]): boolean => {
  const documentStore = useDocumentStore()
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (targets.length === 0) return

    const subscription = combineLatest(
      targets.map((target) =>
        documentStore.pair.editState(target.documentId, target.documentType)
      )
    ).subscribe((states) => {
      setChanged(
        states.some(
          (state) =>
            state.ready &&
            !state.liveEdit &&
            hasContentChanges(state.draft, state.published)
        )
      )
    })

    return () => subscription.unsubscribe()
  }, [documentStore, targets])

  return changed
}

// Sanity clips the preview's media box, so the dot sits inside the icon's own
// bounds rather than hanging off its corner.
const dotStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: DSA_RED,
  // Punches the dot out of the icon behind it.
  boxShadow: "0 0 0 2px var(--card-bg-color)",
}

const wrapperStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
}

/**
 * Sits in a structure list row's icon slot and marks it when the row — or, for a
 * folder row, anything filed under it — has changes the website hasn't seen.
 */
const UnpublishedIndicator = ({
  targets,
  icon: Icon,
}: {
  targets: readonly StatusTarget[]
  icon: ComponentType
}) => {
  const changed = useAnyUnpublished(targets)

  return (
    <span style={wrapperStyle}>
      <Icon />
      {changed && <span title="Unpublished changes" style={dotStyle} />}
    </span>
  )
}

// Structure serializes icons once, so hand it a stable component per row.
const cache = new Map<string, ComponentType>()

/**
 * Builds the icon component for a structure list row. `targets` is every
 * document the row should light up for: itself, or everything it contains.
 */
export const unpublishedIndicator = (
  targets: readonly StatusTarget[],
  icon: ComponentType = FolderIcon
): ComponentType => {
  const key = `${icon.displayName ?? icon.name}|${targets
    .map((target) => target.documentId)
    .join(",")}`

  const cached = cache.get(key)
  if (cached) return cached

  const Indicator = () => <UnpublishedIndicator targets={targets} icon={icon} />
  cache.set(key, Indicator)
  return Indicator
}
