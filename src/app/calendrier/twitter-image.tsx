import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Calendrier de Kraken : Sold Out";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "03 · CALENDRIER", title: "21 jours. Pas une", highlight: "seconde de plus.", tone: "paper" });
}
