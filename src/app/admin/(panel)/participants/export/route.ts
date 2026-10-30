import { NextResponse } from "next/server";

import { countryName } from "@/config/countries";
import type { Prisma } from "@/generated/prisma/client";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/rate-limit";
import { can, getSession } from "@/lib/server/session";
import type { Role } from "@/lib/permissions";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Neutralise les formules (injection CSV) et échappe les guillemets.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** Export CSV des participants (administrateurs, double authentification active). */
export async function GET(request: Request) {
  const session = await getSession();
  const role = (session?.user.role ?? "participant") as Role;
  if (!session || !session.user.twoFactorEnabled || !can(role, { participant: ["export"] })) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const limit = await rateLimit(`export:${session.user.id}`, 10, 3600);
  if (!limit.ok) return NextResponse.json({ error: "Trop d'exports" }, { status: 429 });

  const url = new URL(request.url);
  const status = url.searchParams.get("statut");
  const where: Prisma.ParticipantWhereInput = status ? { status: status as Prisma.ParticipantWhereInput["status"] } : {};
  const rows = await db.participant.findMany({ where, orderBy: { createdAt: "asc" } });

  const header = ["Nom", "E-mail", "Téléphone", "Pays", "Ville", "GitHub", "Niveau", "Langage", "Source", "Nom public", "Statut", "Inscrit le", "Payé le"];
  const lines = rows.map((p) =>
    [p.fullName, p.email, p.phone, countryName(p.country), p.city, p.githubLogin, p.level, p.language, p.referral, p.publicName ? "oui" : "non", p.status, p.createdAt.toISOString(), p.registeredAt?.toISOString()]
      .map(cell)
      .join(";"),
  );
  await audit({ actorId: session.user.id, action: "participants.export", targetType: "participant", targetId: "*", meta: { count: rows.length, status } });

  return new NextResponse(`﻿${[header.map(cell).join(";"), ...lines].join("\r\n")}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="participants-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
