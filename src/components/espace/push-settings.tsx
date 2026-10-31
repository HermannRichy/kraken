"use client";

import { BellOff, BellRing } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { removePushSubscriptionAction, sendTestPushAction } from "@/app/espace/actions";
import { currentSubscription, pushSupported, subscribeDevice } from "@/components/espace/push-client";
import { SubmitButton } from "@/components/form/fields";

type State = "loading" | "unsupported" | "unconfigured" | "denied" | "off" | "on";

/** Réglage des notifications push pour cet appareil : activer, tester, désactiver. */
export function PushSettings({ vapidKey }: { vapidKey?: string }) {
  const [state, setState] = useState<State>("loading");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    const detect = async (): Promise<State> => {
      if (!vapidKey) return "unconfigured";
      if (!pushSupported()) return "unsupported";
      if (Notification.permission === "denied") return "denied";
      if (Notification.permission !== "granted") return "off";
      return (await currentSubscription()) ? "on" : "off";
    };
    detect()
      .then((s) => !cancelled && setState(s))
      .catch(() => !cancelled && setState("off"));
    return () => {
      cancelled = true;
    };
  }, [vapidKey]);

  const enable = () =>
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "denied" : "off");
          toast.message("Notifications refusées", { description: "Autorisez-les dans les réglages du navigateur pour ce site." });
          return;
        }
        if (await subscribeDevice(vapidKey!)) {
          setState("on");
          toast.success("Notifications activées sur cet appareil");
        } else toast.error("Enregistrement impossible. Réessayez plus tard.");
      } catch {
        toast.error("Votre navigateur a refusé l'abonnement.");
      }
    });

  const disable = () =>
    startTransition(async () => {
      try {
        const sub = await currentSubscription();
        if (sub) {
          await removePushSubscriptionAction(sub.endpoint);
          await sub.unsubscribe();
        }
        setState("off");
        toast.success("Notifications désactivées sur cet appareil");
      } catch {
        toast.error("Désactivation impossible.");
      }
    });

  const test = () =>
    startTransition(async () => {
      const res = await sendTestPushAction();
      if (res.ok) toast.success("Notification envoyée", { description: "Elle devrait apparaître dans quelques secondes." });
      else toast.error(res.error ?? "Envoi impossible.");
    });

  const on = state === "on";
  const messages: Record<State, string> = {
    loading: "Vérification…",
    unsupported: "Ce navigateur ne gère pas les notifications push. Sur iPhone, ajoutez d'abord le site à l'écran d'accueil.",
    unconfigured: "Les notifications ne sont pas encore disponibles.",
    denied: "Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages du navigateur, puis rechargez la page.",
    off: "Désactivées sur cet appareil.",
    on: "Activées sur cet appareil.",
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className={`flex size-14 flex-none items-center justify-center rounded-[16px] border-[3px] border-ink ${on ? "bg-kraken text-white" : "bg-paper"}`}>
          {on ? <BellRing size={24} strokeWidth={2.5} aria-hidden="true" /> : <BellOff size={24} strokeWidth={2.5} aria-hidden="true" />}
        </span>
        <div className="min-w-0">
          <div className="text-lg font-extrabold">{on ? "Notifications activées" : "Notifications désactivées"}</div>
          <p className="text-[14px] font-semibold text-steel" role="status">
            {messages[state]}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {state === "off" && (
          <SubmitButton type="button" pending={pending} pendingLabel="Activation…" onClick={enable} className="w-full sm:w-auto">
            Activer sur cet appareil
          </SubmitButton>
        )}
        {on && (
          <>
            <SubmitButton type="button" tone="black" pending={pending} pendingLabel="…" onClick={test} className="w-full sm:w-auto">
              Envoyer un test
            </SubmitButton>
            <SubmitButton type="button" tone="white" pending={pending} pendingLabel="…" onClick={disable} className="w-full sm:w-auto">
              Désactiver
            </SubmitButton>
          </>
        )}
      </div>
    </div>
  );
}
