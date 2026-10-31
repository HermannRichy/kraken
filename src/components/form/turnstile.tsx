"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Turnstile n'est actif que si la clé publique est configurée. */
export const turnstileOn = Boolean(SITE_KEY);

let loader: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loader ??= new Promise<TurnstileApi>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => {
      loader = null;
      s.remove();
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

type Props = { action: string; onToken: (token: string | null) => void; nonce?: number; error?: string; className?: string };

/** Widget Cloudflare Turnstile (vérification anti-robot, souvent invisible pour l'humain). Change `nonce` pour obtenir un nouveau jeton. */
export function Turnstile({ action, onToken, nonce = 0, error, className }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);
  const emit = useEffectEvent((token: string | null) => onToken(token));

  // Jeton à usage unique : nouveau défi après chaque envoi.
  useEffect(() => {
    if (nonce && widget.current && window.turnstile) window.turnstile.reset(widget.current);
  }, [nonce]);

  useEffect(() => {
    if (!SITE_KEY || !box.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !box.current) return;
        widget.current = api.render(box.current, {
          sitekey: SITE_KEY,
          action,
          theme: "light",
          size: "flexible",
          language: "fr",
          callback: (token: string) => emit(token),
          "expired-callback": () => emit(null),
          "error-callback": () => emit(null),
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [action]);

  if (!SITE_KEY) return null;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div ref={box} className="min-h-[65px] w-full" />
      {(failed || error) && (
        <p role="alert" className="text-[13px] leading-snug font-bold text-[#C62828]">
          {failed ? "Vérification anti-robot indisponible. Désactivez votre bloqueur de contenu puis rechargez la page." : error}
        </p>
      )}
    </div>
  );
}

/** État Turnstile d'un formulaire : jeton, remise à zéro après chaque envoi (jeton à usage unique). */
export function useCaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const reset = useCallback(() => {
    setToken(null);
    setNonce((n) => n + 1);
  }, []);
  return { token, setToken, reset, nonce, ready: !turnstileOn || Boolean(token) };
}

export const CAPTCHA_WAIT = "Vérification anti-robot en cours, patientez une seconde.";
