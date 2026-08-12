import type { APIRoute } from "astro"

// todo: harden before use
// todo: update api key to use runtime before use

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()
  const apiKey = import.meta.env.ACTION_NETWORK_API_KEY

  const res = await fetch(
    "https://actionnetwork.org/api/v2/forms/join-tidewater-dsas-email-list/submissions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OSDI-API-Token": apiKey,
      },
      body: JSON.stringify({
        person: {
          given_name: body.firstName,
          family_name: body.lastName,
          email_addresses: [{ address: body.email }],
          ...(body.phone && {
            phone_numbers: [{ number: body.phone }],
          }),
          ...(body.city && {
            postal_addresses: [{ locality: body.city }],
          }),
        },
      }),
    }
  )

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Submission failed" }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
