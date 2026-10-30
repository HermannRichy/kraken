import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Classement de Kraken : Sold Out";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "CLASSEMENT", title: "Ils ont tenu sous la", highlight: "pression.", tone: "black" });
}
