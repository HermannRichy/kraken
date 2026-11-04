import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Mentions et conditions de Kraken, édition 01 — thème Sold Out";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "MENTIONS ET CONDITIONS", title: "Les règles du jeu,", highlight: "noir sur blanc.", tone: "paper" });
}
