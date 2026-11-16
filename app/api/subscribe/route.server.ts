// Newsletter signup: adds the address to a Brevo contact list. On Vercel this runs as a serverless
// function. BREVO_API_KEY and BREVO_LIST_ID come from the Vercel project's environment variables
// (and from .env.local in `npm run dev`). The key never reaches the browser.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  if (typeof email !== "string" || email.length > 254 || !EMAIL.test(email.trim())) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !Number.isInteger(listId) || listId <= 0) {
    // No provider connected yet: say so instead of pretending the signup worked.
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      // updateEnabled: an address that is already a contact is added to the list instead of failing.
      body: JSON.stringify({ email: email.trim(), listIds: [listId], updateEnabled: true }),
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 201 || response.status === 204) {
      return Response.json({ ok: true });
    }
    // Log Brevo's answer for debugging, but never show it to the visitor.
    console.error("Brevo signup failed:", response.status, await response.text());
  } catch (error) {
    console.error("Brevo signup failed:", error);
  }
  return Response.json({ error: "provider" }, { status: 502 });
}
