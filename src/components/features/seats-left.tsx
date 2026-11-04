import { connection } from "next/server";
import { Suspense } from "react";

import { CHALLENGE } from "@/config/challenge";
import { getSeatsCap, seatsLeft } from "@/lib/server/participants";

function SeatsView({ seats, cap }: { seats: number | null; cap: number }) {
  const fill = seats === null ? 0 : Math.round(((cap - seats) / cap) * 100);
  return (
    <>
      <div className="text-5xl leading-none font-extrabold tracking-[-0.03em] lg:text-[52px]">
        {seats ?? "—"}
        <span className="text-2xl">/{cap}</span>
      </div>
      <div className="h-[18px] overflow-hidden rounded-full border-[3px] border-ink bg-white">
        <div data-fill className="h-full rounded-full bg-ink" style={{ width: `${fill}%` }} />
      </div>
    </>
  );
}

/** Compteur lu à chaque requête : isolé ici pour que la page reste pré-rendue (cacheComponents). */
async function LiveSeats() {
  await connection();
  const [seats, cap] = await Promise.all([seatsLeft().catch(() => null), getSeatsCap().catch(() => CHALLENGE.seats)]);
  return <SeatsView seats={seats} cap={cap} />;
}

export function SeatsLeft() {
  return (
    <Suspense fallback={<SeatsView seats={null} cap={CHALLENGE.seats} />}>
      <LiveSeats />
    </Suspense>
  );
}
