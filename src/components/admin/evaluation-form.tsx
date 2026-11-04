"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveEvaluationAction } from "@/app/admin/actions";
export function EvaluationForm({ submissionId, initialScore, initialFeedback, editable }: { submissionId: string; initialScore: number | null; initialFeedback: string | null; editable: boolean }) {
  const [score, setScore] = useState(initialScore?.toString() ?? ""); const [feedback, setFeedback] = useState(initialFeedback ?? ""); const [pending, start] = useTransition();
  if (!editable) return <p className="text-sm font-semibold text-steel">Consultation uniquement.</p>;
  return <form onSubmit={(e) => { e.preventDefault(); start(async () => { const res = await saveEvaluationAction({ submissionId, score: score === "" ? null : Number(score), feedback }); res.ok ? toast.success(res.message) : toast.error(res.error); }); }} className="flex flex-col gap-2"><label className="text-sm font-bold">Note / 100<input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} className="ml-2 w-20 rounded-lg border-2 border-ink px-2 py-1" /></label><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={5000} rows={3} placeholder="Retour au participant (facultatif)" className="rounded-xl border-2 border-ink p-2 text-sm" /><button disabled={pending} className="self-start rounded-xl border-2 border-ink bg-ink px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{pending ? "Enregistrement…" : "Enregistrer mon évaluation"}</button></form>;
}
