import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type OgProps = {
  /** Pastille au-dessus du titre, ex. « 01 · LE DÉFI ». */
  eyebrow: string;
  /** Début du titre, en noir. */
  title: string;
  /** Fin du titre, dans le bloc bleu incliné. */
  highlight: string;
  tone?: "paper" | "black" | "blue";
};

// Lus une seule fois au chargement du module : les images restent générées au build.
const [extraBold, semiBold, logoNoir, logoBlanc, symbole] = await Promise.all([
  readFile(join(process.cwd(), "src", "fonts", "Manrope-800.ttf")),
  readFile(join(process.cwd(), "src", "fonts", "Manrope-600.ttf")),
  readFile(join(process.cwd(), "public", "brand", "kraken-horizontal-noir.svg")),
  readFile(join(process.cwd(), "public", "brand", "kraken-horizontal-blanc.svg")),
  readFile(join(process.cwd(), "public", "brand", "kraken-symbole-bleu.svg")),
]);

/** Image de partage (Open Graph / Twitter) aux couleurs de la charte Kraken. */
export function renderOg({ eyebrow, title, highlight, tone = "paper" }: OgProps) {

  const dark = tone !== "paper";
  const bg = tone === "black" ? "#000000" : tone === "blue" ? "#0047FF" : "#F5F6F8";
  const fg = dark ? "#FFFFFF" : "#000000";
  const logo = `data:image/svg+xml;base64,${(dark ? logoBlanc : logoNoir).toString("base64")}`;
  const sym = `data:image/svg+xml;base64,${symbole.toString("base64")}`;
  const hlBg = tone === "blue" ? "#FFFFFF" : "#0047FF";
  const hlFg = tone === "blue" ? "#000000" : "#FFFFFF";
  const shadow = tone === "black" ? "#FFFFFF" : "#000000";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: bg,
          color: fg,
          padding: "56px 64px",
          fontFamily: "Manrope",
          position: "relative",
          overflow: "hidden",
          border: "10px solid #000000",
        }}
      >
        {tone !== "blue" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sym} width={520} height={520} alt="" style={{ position: "absolute", right: -150, bottom: -170, opacity: dark ? 0.9 : 1 }} />
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={234} height={72} alt="" />
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              border: `4px solid ${fg}`,
              background: dark ? "transparent" : "#FFFFFF",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 22 }}>
            <div
              style={{
                display: "flex",
                padding: "4px 30px 16px",
                background: hlBg,
                color: hlFg,
                border: "6px solid #000000",
                borderRadius: 30,
                boxShadow: `14px 14px 0 ${shadow}`,
                transform: "rotate(-3deg)",
                fontSize: 92,
                fontWeight: 800,
                letterSpacing: -4,
                lineHeight: 1.05,
              }}
            >
              {highlight}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 26, fontWeight: 600 }}>
          {["100 places", "2 000 FCFA", "Solo", "Langage libre"].map((t, i) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: 16,
                border: `4px solid ${tone === "black" ? "#FFFFFF" : "#000000"}`,
                background: i === 1 ? "#000000" : "#FFFFFF",
                color: i === 1 ? "#FFFFFF" : "#000000",
                transform: `rotate(${i % 2 ? 2 : -2}deg)`,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Manrope", data: extraBold, weight: 800, style: "normal" },
        { name: "Manrope", data: semiBold, weight: 600, style: "normal" },
      ],
    },
  );
}
