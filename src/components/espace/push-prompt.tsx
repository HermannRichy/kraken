"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { savePushSubscriptionAction } from "@/app/espace/actions";
import { SubmitButton } from "@/components/form/fields";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const DISMISS_KEY = "kraken-push-later";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/**
 * Proposition d'activer les notifications push à l'arrivée dans l'espace.
 * Le navigateur exige un geste de l'utilisateur : la permission est demandée au clic sur « Activer ».
 */
export function PushPrompt({ vapidKey }: { vapidKey?: string }) {
  const [visible, setVisible] = useState(false);
  const [pending, startTransition] = useTransition();
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vapidKey || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});

    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* stockage indisponible */
    }

    // Déjà autorisé : on (ré)enregistre l'abonnement silencieusement.
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready
        .then(async (reg) => {
          const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) }));
          await savePushSubscriptionAction(sub.toJSON(), navigator.userAgent);
        })
        .catch(() => {});
      return;
    }
    if (Notification.permission === "default" && !dismissed) {
      const t = window.setTimeout(() => setVisible(true), 900);
      return () => window.clearTimeout(t);
    }
  }, [vapidKey]);

  useEffect(() => {
    if (!visible || !card.current || prefersReducedMotion()) return;
    gsap.fromTo(card.current, { y: 120, rotation: -6, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.8)" });
  }, [visible]);

  const later = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* stockage indisponible */
    }
    setVisible(false);
  };

  const enable = () =>
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.message("Notifications désactivées", { description: "Vous pourrez les activer plus tard dans les réglages du navigateur." });
          setVisible(false);
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey!) }));
        const res = await savePushSubscriptionAction(sub.toJSON(), navigator.userAgent);
        if (res.ok) toast.success("Notifications activées", { description: "Paiement, ouverture du défi, rappels : vous serez prévenu." });
        else toast.error("Enregistrement impossible. Réessayez plus tard.");
      } catch {
        toast.error("Votre navigateur a refusé l'abonnement aux notifications.");
      }
      setVisible(false);
    });

  if (!visible) return null;

  return (
    <div
      ref={card}
      role="dialog"
      aria-labelledby="push-title"
      aria-describedby="push-desc"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-[460px] flex-col gap-4 rounded-[26px] border-4 border-ink bg-white p-5 shadow-[10px_10px_0_#0047FF] sm:bottom-6"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-12 flex-none items-center justify-center rounded-full bg-kraken text-white" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </span>
        <div>
          <h2 id="push-title" className="text-xl font-extrabold">
            Activer les notifications ?
          </h2>
          <p id="push-desc" className="text-[15px] font-semibold text-steel">
            Confirmation de paiement, ouverture du défi, rappels avant la date limite : soyez prévenu en direct.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <SubmitButton type="button" pending={pending} pendingLabel="Activation…" onClick={enable} className="min-h-12 flex-1">
          Activer
        </SubmitButton>
        <button type="button" onClick={later} className="min-h-12 px-4 text-[15px] font-extrabold underline decoration-[3px] underline-offset-4">
          Plus tard
        </button>
      </div>
    </div>
  );
}
