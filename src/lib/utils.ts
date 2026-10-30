import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Montant en FCFA avec espaces insécables, identique serveur/navigateur (pas d'ICU). */
export function formatAmount(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}
