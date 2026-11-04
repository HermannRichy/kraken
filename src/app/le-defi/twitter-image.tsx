import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Le défi Kraken, édition 01 — thème Sold Out";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "01 · LE DÉFI", title: "Le dernier billet,", highlight: "jamais deux fois.", tone: "paper" });
}
