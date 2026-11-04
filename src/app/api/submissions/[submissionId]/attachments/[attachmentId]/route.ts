import { NextResponse } from "next/server";

import { privateDownloadUrl } from "@/lib/server/cloudinary";
import { STAFF_ROLES, type Role } from "@/lib/permissions";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";

/** Téléchargement privé : participant propriétaire, équipe organisatrice ou jury uniquement. */
export async function GET(_: Request, { params }: { params: Promise<{ submissionId: string; attachmentId: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Connexion requise", { status: 401 });
  const { submissionId, attachmentId } = await params;
  const attachment = await db.submissionAttachment.findFirst({ where: { id: attachmentId, submissionId }, include: { submission: { select: { participant: { select: { userId: true } } } } } });
  if (!attachment) return new NextResponse("Introuvable", { status: 404 });
  const staff = STAFF_ROLES.includes(session.user.role as Role);
  if (!staff && attachment.submission.participant.userId !== session.user.id) return new NextResponse("Accès refusé", { status: 403 });
  return NextResponse.redirect(privateDownloadUrl(attachment.storageKey, attachment.fileName));
}
