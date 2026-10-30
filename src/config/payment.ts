/** Frais d'inscription (FCFA). Le montant est toujours fixé côté serveur. */
export const REGISTRATION_FEE = 2000;

/** Réseaux Mobile Money acceptés (slugs confirmés en production). */
export const NETWORKS = [
  { slug: "mtn", label: "MTN Bénin", country: "BJ", dial: "229" },
  { slug: "moov", label: "Moov Bénin", country: "BJ", dial: "229" },
  { slug: "celtiis_bj", label: "Celtiis Bénin", country: "BJ", dial: "229" },
  { slug: "togocom_tg", label: "Togocom Togo", country: "TG", dial: "228" },
  { slug: "moov_tg", label: "Moov Togo", country: "TG", dial: "228" },
  { slug: "mtn_ci", label: "MTN Côte d'Ivoire", country: "CI", dial: "225" },
  { slug: "moov_ci", label: "Moov Côte d'Ivoire", country: "CI", dial: "225" },
  { slug: "orange_ci", label: "Orange Côte d'Ivoire", country: "CI", dial: "225" },
  { slug: "wave_ci", label: "Wave Côte d'Ivoire", country: "CI", dial: "225" },
  { slug: "orange_sn", label: "Orange Sénégal", country: "SN", dial: "221" },
  { slug: "wave_sn", label: "Wave Sénégal", country: "SN", dial: "221" },
  { slug: "free_sn", label: "Free Sénégal", country: "SN", dial: "221" },
  { slug: "moov_bf", label: "Moov Burkina Faso", country: "BF", dial: "226" },
  { slug: "orange_bf", label: "Orange Burkina Faso", country: "BF", dial: "226" },
  { slug: "wave_bf", label: "Wave Burkina Faso", country: "BF", dial: "226" },
  { slug: "orange_ml", label: "Orange Mali", country: "ML", dial: "223" },
  { slug: "mobicash_ml", label: "Mobicash Mali", country: "ML", dial: "223" },
  { slug: "mtn_cg", label: "MTN Congo", country: "CG", dial: "242" },
] as const;

export type NetworkSlug = (typeof NETWORKS)[number]["slug"];
