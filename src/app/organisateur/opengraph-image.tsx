import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "HustlerLabs, organisateur de Kraken";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "ORGANISATEUR", title: "Des challenges", highlight: "exigeants.", tone: "blue" });
}
