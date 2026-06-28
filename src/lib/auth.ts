/**
 * Single-password auth gate. No SMTP, no database, no third party.
 *
 * The session cookie stores a SHA-256 of the password (so the raw password is
 * never stored in the cookie, and the cookie can't be forged without it).
 * Uses Web Crypto so it runs in both the Edge middleware and Node runtimes.
 */
export const SESSION_COOKIE = "pfab_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function sessionToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`pfab-auth:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
