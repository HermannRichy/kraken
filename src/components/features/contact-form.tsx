"use client";

import { useRef } from "react";

import { AnimatedIcon } from "@/components/motion/animated-icon";
import { HoverContext, useHoverLift } from "@/components/motion/hover";
import { Pop } from "@/components/motion/pop";
import { Burst } from "@/components/ui/doodles";

const FIELD =
  "min-h-[52px] w-full rounded-[14px] border-[3px] border-ink bg-white px-4 text-base font-semibold outline-none transition-shadow focus:shadow-[4px_4px_0_#0047FF]";

/** Formulaire de contact. L'envoi n'est pas encore branché. */
export function ContactForm() {
  const btn = useRef<HTMLButtonElement>(null);
  const { hovered, handlers } = useHoverLift(btn, { x: -3, y: -3, scale: 1, boxShadow: ["5px 5px 0 #000", "9px 9px 0 #000"] });

  return (
    <Pop lift={-6} scale={1.01}>
      <form
        onSubmit={(e) => {
          // TODO : brancher l'envoi (route handler + service d'e-mail).
          e.preventDefault();
        }}
        className="flex flex-col gap-[18px] rounded-[32px] border-4 border-ink bg-paper p-6 shadow-[12px_12px_0_#000] [transform:perspective(1200px)_rotateY(-7deg)_rotateX(3deg)_rotateZ(1.2deg)] sm:p-[34px]"
      >
        <h2 className="text-3xl font-extrabold tracking-[-0.02em]">Écrire à l&apos;organisation</h2>
        <label className="flex flex-col gap-2 text-[15px] font-extrabold">
          Nom complet
          <input required name="nom" type="text" autoComplete="name" className={FIELD} />
        </label>
        <label className="flex flex-col gap-2 text-[15px] font-extrabold">
          E-mail
          <input required name="email" type="email" autoComplete="email" className={FIELD} />
        </label>
        <label className="flex flex-col gap-2 text-[15px] font-extrabold">
          Message
          <textarea required name="message" rows={5} className={`${FIELD} resize-y py-3.5`} />
        </label>
        <HoverContext.Provider value={hovered}>
          <button
            ref={btn}
            type="submit"
            {...handlers}
            style={{ boxShadow: "5px 5px 0 #000" }}
            className="inline-flex min-h-14 items-center gap-2.5 self-start rounded-[18px] border-[3px] border-ink bg-kraken px-6 text-[17px] font-extrabold text-white"
          >
            Envoyer
            <AnimatedIcon name="send" size={20} />
          </button>
        </HoverContext.Provider>
      </form>
      <Burst flip size={44} className="-top-6 -right-3.5" />
    </Pop>
  );
}
