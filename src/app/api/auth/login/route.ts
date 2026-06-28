import { env, features } from "@/lib/env";
import { SESSION_COOKIE, SESSION_MAX_AGE, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  if (!features.auth) return Response.json({ ok: true }); // auth disabled

  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  if (password !== env.APP_PASSWORD) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await sessionToken(env.APP_PASSWORD!);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`,
  );
  return res;
}
