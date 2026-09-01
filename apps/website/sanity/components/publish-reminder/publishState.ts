import { createContext, useContext } from "react"
import type { SanityDocument } from "sanity"

export interface PublishState {
  /** True while a draft exists that hasn't been published to the live site. */
  hasUnpublishedChanges: boolean
  /** What the website is currently serving, for diffing against the draft. */
  publishedDocument: SanityDocument | null
}

// Filled in by DocumentPublishBanner at the form root so nested inputs (arrays,
// mostly) can compare themselves against what is actually live.
export const PublishStateContext = createContext<PublishState>({
  hasUnpublishedChanges: false,
  publishedDocument: null,
})

export const usePublishState = (): PublishState =>
  useContext(PublishStateContext)
