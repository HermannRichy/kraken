import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Documentation de Kraken : Sold Out";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "DOCUMENTATION", title: "Tout est public.", highlight: "Sauf les pièges.", tone: "black" });
}
