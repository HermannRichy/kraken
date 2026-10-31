export const STATUS: Record<string, { label: string; tone: string }> = {
  pre_registered: { label: "E-mail à confirmer", tone: "bg-white text-ink" },
  email_confirmed: { label: "Paiement attendu", tone: "bg-[#FFF4E5] text-ink" },
  payment_pending: { label: "Paiement en cours", tone: "bg-[#FFF4E5] text-ink" },
  registered: { label: "Inscrit", tone: "bg-kraken text-white" },
  waitlisted: { label: "Liste d'attente", tone: "bg-ink text-white" },
  withdrawn: { label: "Désisté", tone: "bg-mist text-ink" },
  delivered: { label: "Livré", tone: "bg-kraken text-white" },
  evaluated: { label: "Évalué", tone: "bg-kraken text-white" },
  disqualified: { label: "Disqualifié", tone: "bg-[#C62828] text-white" },
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "En attente", tone: "bg-[#FFF4E5] text-ink" },
  succeeded: { label: "Réussi", tone: "bg-kraken text-white" },
  failed: { label: "Échoué", tone: "bg-[#FFE9E9] text-ink" },
  refunded: { label: "Remboursé", tone: "bg-mist text-ink" },
};

export const canPay = (status: string) => status === "email_confirmed" || status === "payment_pending";
export const hasKeys = (status: string) => status === "registered" || status === "delivered" || status === "evaluated";

export const fmtDateTime = (d: Date) => d.toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", dateStyle: "long", timeStyle: "short" });
