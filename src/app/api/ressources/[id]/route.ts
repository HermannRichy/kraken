import { NextResponse } from "next/server";
import { privateDownloadUrl } from "@/lib/server/cloudinary";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Connexion requise", { status: 401 });
  const resource = await db.resource.findUnique({ where: { id: (await params).id } });
  if (!resource || resource.status !== "published" || resource.audience !== "participant" || (resource.availableAt && resource.availableAt > new Date()) || !resource.storageKey) return new NextResponse("Introuvable", { status: 404 });
  const participant = await db.participant.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!participant) return new NextResponse("Accès refusé", { status: 403 });
  return NextResponse.redirect(privateDownloadUrl(resource.storageKey, resource.fileName ?? "resource"));
}
