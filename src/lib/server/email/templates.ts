import "server-only";

import { CHALLENGE } from "@/config/challenge";

import { renderEmail } from "./layout";

const firstName = (full: string) => full.trim().split(/\s+/)[0] || full;

export const templates = {
  verifyEmail: (p: { name: string; url: string }) =>
    renderEmail({
      subject: "Confirmez votre adresse · Kraken : Sold Out",
      preheader: "Un clic pour confirmer votre inscription au défi.",
      title: `Bienvenue, ${firstName(p.name)} !`,
      blocks: [
        { kind: "p", text: "Votre inscription à Kraken : Sold Out est enregistrée. Confirmez votre adresse e-mail pour accéder à votre espace et régler les frais de participation." },
        { kind: "button", label: "Confirmer mon adresse", url: p.url },
        { kind: "small", text: "Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message." },
      ],
    }),

  magicLink: (p: { url: string }) =>
    renderEmail({
      subject: "Votre lien de connexion · Kraken",
      preheader: "Connexion à votre espace participant.",
      title: "Connexion à votre espace",
      blocks: [
        { kind: "p", text: "Cliquez sur le bouton ci-dessous pour vous connecter. Aucun mot de passe à retenir." },
        { kind: "button", label: "Me connecter", url: p.url },
        { kind: "small", text: "Ce lien est valable 15 minutes et ne fonctionne qu'une fois. Si vous n'avez rien demandé, ignorez ce message." },
      ],
    }),

  paymentReceipt: (p: { name: string; amount: number; network: string; reference: string; date: string; url: string }) =>
    renderEmail({
      subject: "Reçu et bienvenue · Kraken : Sold Out",
      preheader: "Paiement confirmé : votre place est réservée.",
      title: "Votre place est réservée.",
      blocks: [
        { kind: "p", text: `Merci ${firstName(p.name)}, votre paiement est confirmé. Vos clés de test KrakenPay vous attendent dans votre espace participant (elles ne sont jamais envoyées par e-mail).` },
        {
          kind: "box",
          rows: [
            ["Montant", `${p.amount.toLocaleString("fr-FR")} FCFA`],
            ["Moyen", `Mobile Money · ${p.network}`],
            ["Référence", p.reference],
            ["Date", p.date],
          ],
        },
        { kind: "p", text: "Prochaine étape : l'ouverture du défi le 10 novembre. La documentation sera publiée dans votre espace." },
        { kind: "button", label: "Ouvrir mon espace", url: p.url },
        { kind: "small", text: `Remboursement possible jusqu'à ${CHALLENGE.refundDays} jours après l'inscription, en écrivant à ${process.env.EMAIL_FROM_ADDRESS ?? "kraken@hustlerlabs.tech"}.` },
      ],
    }),

  paymentFailed: (p: { name: string; reason: string; url: string }) =>
    renderEmail({
      subject: "Paiement non abouti · Kraken : Sold Out",
      preheader: "Votre paiement n'a pas été confirmé.",
      title: "Le paiement n'a pas abouti.",
      blocks: [
        { kind: "p", text: `${firstName(p.name)}, votre paiement Mobile Money n'a pas été confirmé (${p.reason}). Aucun montant n'a été débité. Vous pouvez réessayer depuis votre espace.` },
        { kind: "button", label: "Réessayer le paiement", url: p.url },
      ],
    }),

  waitlisted: (p: { name: string; url: string }) =>
    renderEmail({
      subject: "Liste d'attente · Kraken : Sold Out",
      preheader: "Les 100 places sont prises : vous êtes en liste d'attente.",
      title: "Vous êtes en liste d'attente.",
      blocks: [
        { kind: "p", text: `${firstName(p.name)}, les ${CHALLENGE.seats} places sont actuellement prises. Vous êtes inscrit en liste d'attente : si une place se libère, vous serez prévenu par e-mail et notification.` },
        { kind: "button", label: "Voir mon espace", url: p.url },
      ],
    }),

  staffInvite: (p: { name: string; role: string; url: string }) =>
    renderEmail({
      subject: "Accès à l'espace d'administration · Kraken",
      preheader: "Définissez votre mot de passe.",
      title: `Bienvenue dans l'équipe, ${firstName(p.name)}.`,
      blocks: [
        { kind: "p", text: `Un accès « ${p.role} » vous a été ouvert sur l'espace d'administration de Kraken : Sold Out. Définissez votre mot de passe, puis activez la double authentification à la première connexion.` },
        { kind: "button", label: "Définir mon mot de passe", url: p.url },
        { kind: "small", text: "Ce lien est valable 1 heure." },
      ],
    }),

  passwordReset: (p: { url: string }) =>
    renderEmail({
      subject: "Réinitialisation du mot de passe · Kraken",
      preheader: "Lien de réinitialisation de votre mot de passe.",
      title: "Nouveau mot de passe",
      blocks: [
        { kind: "p", text: "Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe." },
        { kind: "button", label: "Définir un mot de passe", url: p.url },
        { kind: "small", text: "Ce lien est valable 1 heure. Si vous n'avez rien demandé, ignorez ce message." },
      ],
    }),

  contactAck: (p: { name: string }) =>
    renderEmail({
      subject: "Message bien reçu · Kraken",
      preheader: "Nous revenons vers vous rapidement.",
      title: "Message bien reçu.",
      blocks: [{ kind: "p", text: `Merci ${firstName(p.name)}, votre message est arrivé chez l'équipe HustlerLabs. Nous vous répondons au plus vite.` }],
    }),

  contactNotify: (p: { name: string; email: string; message: string }) =>
    renderEmail({
      subject: `Nouveau message de ${p.name} · Kraken`,
      preheader: p.message.slice(0, 80),
      title: "Nouveau message de contact",
      blocks: [
        { kind: "box", rows: [["Nom", p.name], ["E-mail", p.email]] },
        { kind: "p", text: p.message },
      ],
    }),
};
