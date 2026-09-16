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
      // CDN in production to keep uncached API requests off the project quota;
      // it self-purges on publish, so a re-render can only race it for about a
      // second. Never with visual editing on — draft content is fetched with a
      // token and the CDN can't serve authenticated responses.
      useCdn: !visualEditingEnabled,
      ...(visualEditingEnabled ? { token } : {}),
    }
  )

  return {
    data: result,
    sourceMap: resultSourceMap,
    perspective,
  }
}
