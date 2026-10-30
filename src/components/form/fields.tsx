"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-[14px] border-[3px] border-ink bg-white px-4 text-base font-semibold text-ink outline-none transition-[box-shadow,transform] placeholder:font-medium placeholder:text-smoke focus:shadow-[4px_4px_0_#0047FF] disabled:cursor-not-allowed disabled:bg-paper aria-[invalid=true]:border-[#C62828] aria-[invalid=true]:shadow-[4px_4px_0_#C62828]";

type FieldShellProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
  status?: ReactNode;
};

/** Libellé, aide et message d'erreur reliés au champ (accessibilité). */
export function FieldShell({ label, hint, error, optional, children, className, status }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[15px] font-extrabold">
        <span>
          {label}
          {optional && <span className="ml-1.5 text-[13px] font-semibold text-steel">(facultatif)</span>}
        </span>
        {status}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-[13px] leading-snug font-semibold text-steel">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-[13px] leading-snug font-bold text-[#C62828]">
          <span aria-hidden="true">✶</span>
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; error?: string; optional?: boolean; status?: ReactNode; addon?: ReactNode };

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { label, hint, error, optional, status, className, addon, ...props },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional} status={status} className={className}>
      {({ id, describedBy, invalid }) =>
        addon ? (
          <div className="flex gap-2">
            {addon}
            <input ref={ref} id={id} aria-describedby={describedBy} aria-invalid={invalid} className={cn(CONTROL, "min-h-[52px]")} {...props} />
          </div>
        ) : (
          <input ref={ref} id={id} aria-describedby={describedBy} aria-invalid={invalid} className={cn(CONTROL, "min-h-[52px]")} {...props} />
        )
      }
    </FieldShell>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: ReactNode; error?: string; optional?: boolean; children: ReactNode };

export function SelectField({ label, hint, error, optional, className, children, ...props }: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select id={id} aria-describedby={describedBy} aria-invalid={invalid} className={cn(CONTROL, "min-h-[52px] appearance-none pr-11")} {...props}>
            {children}
          </select>
          <svg className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      )}
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: ReactNode; error?: string };

export function TextareaField({ label, hint, error, className, ...props }: TextareaProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className={cn(CONTROL, "min-h-36 resize-y py-3.5")} {...props} />
      )}
    </FieldShell>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode; error?: string };

/** Case à cocher néo-brutaliste (jamais précochée pour les consentements). */
export function Checkbox({ label, error, className, ...props }: CheckboxProps) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="group flex cursor-pointer items-start gap-3 text-[15px] leading-snug font-semibold">
        <input id={id} type="checkbox" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-e` : undefined} className="peer sr-only" {...props} />
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-6 flex-none items-center justify-center rounded-lg border-[3px] border-ink bg-white text-white transition-colors peer-checked:bg-kraken peer-focus-visible:shadow-[3px_3px_0_#0047FF] peer-aria-[invalid=true]:border-[#C62828]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${id}-e`} role="alert" className="ml-9 text-[13px] font-bold text-[#C62828]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

type SubmitProps = { pending: boolean; children: ReactNode; pendingLabel?: string; className?: string; tone?: "blue" | "black" | "white"; type?: "submit" | "button"; onClick?: () => void; disabled?: boolean };

/** Bouton d'envoi : état de chargement, protégé contre le double clic. */
export function SubmitButton({ pending, children, pendingLabel = "Envoi…", className, tone = "blue", type = "submit", onClick, disabled }: SubmitProps) {
  const tones = {
    blue: "bg-kraken text-white shadow-[5px_5px_0_#000]",
    black: "bg-ink text-white shadow-[5px_5px_0_#0047FF]",
    white: "bg-white text-ink shadow-[5px_5px_0_#000]",
  } as const;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-2.5 rounded-[18px] border-[3px] border-ink px-6 text-[17px] font-extrabold transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0",
        tones[tone],
        className,
      )}
    >
      {pending && <Spinner />}
      <span>{pending ? pendingLabel : children}</span>
    </button>
  );
}
