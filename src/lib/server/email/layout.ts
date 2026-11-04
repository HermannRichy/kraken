import "server-only";

import { SITE_URL } from "@/config/site";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

type Block = { kind: "p"; text: string } | { kind: "button"; label: string; url: string } | { kind: "box"; rows: [string, string][] } | { kind: "small"; text: string };

export type EmailContent = {
  subject: string;
  preheader: string;
  title: string;
  blocks: Block[];
};

/** Gabarit HTML néo-brutaliste compatible clients mail (tables + styles en ligne) et version texte. */
export function renderEmail({ subject, preheader, title, blocks }: EmailContent) {
  const body = blocks
    .map((b) => {
      if (b.kind === "p") return `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#000">${esc(b.text)}</p>`;
      if (b.kind === "small") return `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#626670">${esc(b.text)}</p>`;
      if (b.kind === "button")
        return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td style="background:#0047FF;border:3px solid #000;border-radius:14px;box-shadow:5px 5px 0 #000"><a href="${esc(b.url)}" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:800;color:#fff;text-decoration:none">${esc(b.label)}</a></td></tr></table>`;
      return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 20px;border:3px solid #000;border-radius:14px;background:#F5F6F8">${b.rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:10px 16px;font-size:13px;font-weight:700;color:#626670;border-bottom:1px solid #D5D8DE">${esc(k)}</td><td style="padding:10px 16px;font-size:15px;font-weight:800;color:#000;text-align:right;border-bottom:1px solid #D5D8DE">${esc(v)}</td></tr>`,
        )
        .join("")}</table>`;
    })
    .join("");

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F5F6F8;font-family:Manrope,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F6F8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 16px"><img src="${SITE_URL}/icons/icon-192.png" width="44" height="44" alt="Kraken" style="display:block;border-radius:10px"></td></tr>
<tr><td style="background:#fff;border:4px solid #000;border-radius:24px;box-shadow:8px 8px 0 #000;padding:30px 28px">
<h1 style="margin:0 0 18px;font-size:28px;line-height:1.1;font-weight:800;letter-spacing:-0.5px;color:#000">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 6px 0;font-size:12px;line-height:1.5;color:#626670">Kraken · Édition 01 — Sold Out · HustlerLabs<br>Votre back-end. Sous pression.<br><a href="${SITE_URL}" style="color:#0047FF">${SITE_URL.replace(/^https?:\/\//, "")}</a></td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    title,
    "",
    ...blocks.map((b) => {
      if (b.kind === "button") return `${b.label} : ${b.url}`;
      if (b.kind === "box") return b.rows.map(([k, v]) => `${k} : ${v}`).join("\n");
      return b.text;
    }),
    "",
    "Kraken · Édition 01 — Sold Out · HustlerLabs",
    SITE_URL,
  ].join("\n\n");

  return { subject, html, text };
}
