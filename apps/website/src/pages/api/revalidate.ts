import type { APIRoute } from "astro"

/**
 * Sanity webhook target. Purges the Cloudflare edge cache so a publish is live
 * immediately instead of waiting out the edge TTL in `lib/cache-headers.ts`.
 *
 * Point a webhook at POST /api/revalidate in Sanity Manage (API → Webhooks),
 * triggering on create/update/delete, and add a header matching
 * SANITY_REVALIDATE_SECRET.
 *
 * Purges the whole zone rather than a URL list: page content is reachable from
 * several routes (a document can appear on the home page, its own slug, and a
 * listing), so mapping a document to the pages that embed it is guesswork.
 * Assets are hashed and re-served from the ASSETS binding, so a full purge
 * costs a handful of cheap re-renders.
 */

const JSON_HEADERS = { "Content-Type": "application/json" }

const SECRET_HEADER = "x-revalidate-secret"

interface RevalidateResponse {
  purged?: true
  error?: string
}

const json = (body: RevalidateResponse, status: number): Response =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

/**
 * Length-independent compare so a wrong secret can't be recovered by timing.
 * Both sides are trimmed: `wrangler secret put` keeps a trailing newline when
 * its input is piped, which is invisible in the dashboard and fails every compare.
 */
const secretsMatch = (rawA: string, rawB: string): boolean => {
  const a = rawA.trim()
  const b = rawB.trim()

  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

const purgeZone = async (zoneId: string, token: string): Promise<void> => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ purge_everything: true }),
    }
  )

  if (!res.ok) {
    throw new Error(
      `Cloudflare purge failed: ${res.status} ${await res.text()}`
    )
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env
  const secret = env?.SANITY_REVALIDATE_SECRET
  const zoneId = env?.CF_ZONE_ID
  const token = env?.CF_PURGE_TOKEN

  if (!secret || !zoneId || !token) {
    return json({ error: "Revalidation is not configured." }, 503)
  }

  // Split so the webhook delivery log distinguishes a misconfigured Sanity
  // webhook (secret in the wrong field, so no header at all) from a genuine
  // mismatch. The header name isn't secret — it's in the README.
  const provided = request.headers.get(SECRET_HEADER)
  if (!provided) {
    return json({ error: `Missing ${SECRET_HEADER} header.` }, 401)
  }

  if (!secretsMatch(provided, secret)) {
    return json({ error: "Secret mismatch." }, 401)
  }

  try {
    await purgeZone(zoneId, token)
    return json({ purged: true }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[revalidate] purge failed:", message)

    // Non-2xx so Sanity retries rather than silently leaving the cache stale.
    return json({ error: message }, 502)
  }
}
