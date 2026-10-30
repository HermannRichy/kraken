import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Le défi",
    links: [
      { href: "/le-defi", label: "Le sujet" },
      { href: "/regles", label: "Règles et barème" },
      { href: "/calendrier", label: "Calendrier" },
      { href: "/documentation", label: "Documentation" },
    ],
  },
  {
    title: "Participer",
    links: [
      { href: "/prix", label: "Prix et certificats" },
      { href: "/faq", label: "FAQ" },
      { href: "/classement", label: "Classement" },
    ],
  },
  {
    title: "Organisateur",
    links: [
      { href: "/organisateur", label: "HustlerLabs" },
      { href: "/organisateur#contact", label: "Contact" },
      { href: "/mentions", label: "Mentions et conditions" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-ink text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-9 px-4 pt-14 pb-9 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div className="flex max-w-[360px] flex-col gap-4">
            <Image src="/brand/kraken-horizontal-blanc.svg" alt="Kraken by HustlerLabs" width={182} height={56} className="h-12 w-[156px] self-start lg:h-14 lg:w-[182px]" />
            <p className="text-[15px] leading-relaxed font-semibold text-mist">
              Des challenges de développement exigeants. Organisé par HustlerLabs.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-14 gap-y-8 text-[15px] font-bold sm:flex sm:flex-wrap">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-0.5">
                <div className="pb-1.5 text-xs tracking-[0.1em] text-smoke uppercase">{col.title}</div>
                {col.links.map((l) => (
                  <Link key={l.label} href={l.href} className="py-2 text-white hover:text-kraken">
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t-2 border-graphite pt-5 text-[13px] font-semibold text-smoke">
          <span>© 2026 HustlerLabs · Kraken : Sold Out, édition 01</span>
          <span>Votre back-end. Sous pression.</span>
        </div>
      </div>
    </footer>
  );
}
