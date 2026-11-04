import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "FAQ de Kraken, édition 01 — thème Sold Out";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "05 · FAQ", title: "Avant de payer", highlight: "quoi que ce soit.", tone: "paper" });
}
