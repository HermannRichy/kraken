import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Prix et certificats de Kraken : Sold Out";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "04 · PRIX ET CERTIFICATS", title: "Livrez. On vous le", highlight: "certifie.", tone: "paper" });
}
