import "server-only";

import webpush from "web-push";

import { db } from "./db";
import { env } from "./env";

let configured = false;

function setup() {
  if (configured) return true;
  const { NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = env();
  if (!NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

/** Envoie une notification push à tous les appareils d'un utilisateur. Nettoie les abonnements expirés. */
export async function pushToUser(userId: string, payload: PushPayload) {
  if (!setup()) return { sent: 0 };
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", ...payload }),
          { TTL: 60 * 60 * 24, urgency: "normal" },
        );
        sent++;
      } catch (error) {
        const code = (error as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        else console.error("[push] échec", code, (error as Error).message);
      }
    }),
  );
  return { sent };
}
