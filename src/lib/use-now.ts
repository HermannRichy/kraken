"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Heure courante côté client, rafraîchie à intervalle régulier.
 * Renvoie `null` au rendu serveur et à l'hydratation (pas de décalage d'hydratation).
 */
export function useNow(interval = 1000): number | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const id = window.setInterval(onChange, interval);
      return () => window.clearInterval(id);
    },
    [interval],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / interval) * interval,
    () => null,
  );
}
