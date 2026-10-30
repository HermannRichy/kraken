import { NextResponse } from "next/server";

import { hashIp } from "@/lib/server/crypto";
import { checkGithubUser } from "@/lib/server/participants";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp, isSameOrigin } from "@/lib/server/request";
import { githubLogin } from "@/lib/validation";

/** Vérification en direct de l'existence d'un compte GitHub (formulaire d'inscription). */
export async function GET(request: Request, { params }: RouteContext<"/api/github/[login]">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origine refusée" }, { status: 403 });
  const ipHash = hashIp(await getClientIp()) ?? "unknown";
  const limit = await rateLimit(`github-check:${ipHash}`, 30, 60);
  if (!limit.ok) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });

  const parsed = githubLogin.safeParse((await params).login);
  if (!parsed.success) return NextResponse.json({ valid: false, exists: false });
  const res = await checkGithubUser(parsed.data.toLowerCase());
  return NextResponse.json({ valid: true, exists: res.exists, checked: res.reachable }, { headers: { "cache-control": "private, max-age=300" } });
}
