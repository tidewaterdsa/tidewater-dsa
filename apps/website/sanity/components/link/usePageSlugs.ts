import { useEffect, useState } from "react"
import { useClient } from "sanity"
import { SANITY_API_VERSION } from "@/lib/sanity-config"

const PAGE_SLUGS_QUERY = `*[_type == "page" && defined(slug.current)].slug.current`

// Every link field on a document would otherwise fetch the same slug list, so
// the request is shared for the lifetime of the Studio session.
let pageSlugsRequest: Promise<string[]> | null = null

/** Slugs of the pages admins have published, or null until they arrive. */
export const usePageSlugs = (): string[] | null => {
  const client = useClient({ apiVersion: SANITY_API_VERSION })
  const [slugs, setSlugs] = useState<string[] | null>(null)

  useEffect(() => {
    let active = true

    // An unreachable dataset shouldn't turn every internal link into a warning.
    pageSlugsRequest ??= client
      .fetch<string[] | null>(PAGE_SLUGS_QUERY)
      .then((result) => result ?? [])
      .catch(() => [])

    pageSlugsRequest.then((result) => {
      if (active) setSlugs(result)
    })

    return () => {
      active = false
    }
  }, [client])

  return slugs
}
