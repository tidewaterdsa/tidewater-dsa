import { type QueryParams } from "sanity"
import { sanityClient } from "sanity:client"

const visualEditingEnabled =
  import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true"

const token = import.meta.env.SANITY_API_READ_TOKEN

export async function loadQuery<QueryResponse>({
  query,
  params,
}: {
  query: string
  params?: QueryParams
}) {
  if (visualEditingEnabled && !token) {
    throw new Error(
      "The `SANITY_API_READ_TOKEN` environment variable is required during Visual Editing."
    )
  }

  const perspective = visualEditingEnabled ? "drafts" : "published"

  const { result, resultSourceMap } = await sanityClient.fetch<QueryResponse>(
    query,
    params ?? {},
    {
      filterResponse: false,
      perspective,
      resultSourceMap: visualEditingEnabled ? "withKeyArraySelector" : false,
      stega: visualEditingEnabled,
      // Uncached: publishing purges the edge, and a re-render that raced
      // Sanity's own CDN could re-cache stale content for the full TTL.
      // The edge cache means misses are rare, so this costs few API calls.
      useCdn: false,
      ...(visualEditingEnabled ? { token } : {}),
    }
  )

  return {
    data: result,
    sourceMap: resultSourceMap,
    perspective,
  }
}
