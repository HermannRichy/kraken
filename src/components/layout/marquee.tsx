import { cn } from "@/lib/utils";

type Props = {
  items: string[];
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
  reverse?: boolean;
  speed?: number;
};

/** Bandeau défilant infini (animé par PageMotion via data-marquee). */
export function Marquee({ items, className, itemClassName, separatorClassName = "text-kraken", reverse, speed }: Props) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className={cn("flex items-center whitespace-nowrap", itemClassName)}>
          {item}
          <span className={cn("px-5", separatorClassName)} aria-hidden="true">
            ✶
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div
      data-marquee={reverse ? "reverse" : ""}
      data-speed={speed}
      className={cn("overflow-hidden whitespace-nowrap", className)}
    >
      <div className="flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
