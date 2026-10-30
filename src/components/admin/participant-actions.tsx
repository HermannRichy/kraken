"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addNoteAction, disqualifyAction, regenerateParticipantKeysAction, resendEmailAction, withdrawAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/form/fields";

type Props = {
  participantId: string;
  emailVerified: boolean;
  status: string;
  perms: { resend: boolean; note: boolean; disqualify: boolean; update: boolean; keys: boolean };
};

const BTN = "inline-flex min-h-11 items-center rounded-[14px] border-[3px] border-ink bg-white px-4 text-sm font-extrabold shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5 disabled:opacity-50";

export function ParticipantActions({ participantId, emailVerified, status, perms }: Props) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"none" | "disqualify" | "withdraw">("none");
  const [reason, setReason] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(res.message ?? "Fait.");
        setMode("none");
        setReason("");
      } else toast.error(res.error ?? "Action impossible.");
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2.5">
        {perms.resend && !emailVerified && (
          <button type="button" disabled={pending} className={BTN} onClick={() => run(() => resendEmailAction(participantId, "verify"))}>
            Renvoyer la confirmation
          </button>
        )}
        {perms.resend && emailVerified && (
          <button type="button" disabled={pending} className={BTN} onClick={() => run(() => resendEmailAction(participantId, "login"))}>
            Envoyer un lien de connexion
          </button>
        )}
        {perms.keys && status === "registered" && (
          <button type="button" disabled={pending} className={BTN} onClick={() => run(() => regenerateParticipantKeysAction(participantId), "Révoquer les clés actuelles et en émettre de nouvelles ?")}>
            Régénérer les clés
          </button>
        )}
        {perms.update && !["withdrawn", "disqualified"].includes(status) && (
          <button type="button" disabled={pending} className={BTN} onClick={() => setMode("withdraw")}>
            Désistement
          </button>
        )}
        {perms.disqualify && status !== "disqualified" && (
          <button type="button" disabled={pending} className={`${BTN} bg-[#FFE9E9]`} onClick={() => setMode("disqualify")}>
            Disqualifier
          </button>
        )}
      </div>

      {mode === "disqualify" && (
        <div className="flex flex-col gap-3 rounded-[18px] border-[3px] border-ink bg-[#FFE9E9] p-4">
          <label className="flex flex-col gap-2 text-sm font-extrabold">
            Motif (communiqué au participant)
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} className="rounded-[12px] border-[3px] border-ink bg-white p-3 font-semibold" />
          </label>
          <div className="flex gap-2">
            <SubmitButton type="button" tone="black" pending={pending} className="min-h-11" onClick={() => run(() => disqualifyAction(participantId, reason))}>
              Confirmer la disqualification
            </SubmitButton>
            <button type="button" className="px-3 font-extrabold" onClick={() => setMode("none")}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {mode === "withdraw" && (
        <div className="flex flex-col gap-3 rounded-[18px] border-[3px] border-ink bg-[#FFF4E5] p-4">
          <p className="text-sm font-bold">Le remboursement Mobile Money se fait depuis le dashboard FeexPay. Indiquez s&apos;il a été effectué.</p>
          <div className="flex flex-wrap gap-2">
            <SubmitButton type="button" tone="black" pending={pending} className="min-h-11" onClick={() => run(() => withdrawAction(participantId, true))}>
              Désisté et remboursé
            </SubmitButton>
            <SubmitButton type="button" tone="white" pending={pending} className="min-h-11" onClick={() => run(() => withdrawAction(participantId, false))}>
              Désisté sans remboursement
            </SubmitButton>
            <button type="button" className="px-3 font-extrabold" onClick={() => setMode("none")}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NoteForm({ participantId }: { participantId: string }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await addNoteAction(participantId, body);
          if (res.ok) {
            setBody("");
            toast.success("Note ajoutée");
          } else toast.error(res.error);
        });
      }}
      className="flex flex-col gap-2"
    >
      <label className="sr-only" htmlFor="note">
        Nouvelle note
      </label>
      <textarea id="note" value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={2000} placeholder="Note interne (visible par l'équipe uniquement)" className="rounded-[14px] border-[3px] border-ink bg-white p-3 font-semibold outline-none focus:shadow-[3px_3px_0_#0047FF]" />
      <SubmitButton pending={pending} tone="black" className="min-h-11 self-start" disabled={body.trim().length < 2}>
        Ajouter la note
      </SubmitButton>
    </form>
  );
}
