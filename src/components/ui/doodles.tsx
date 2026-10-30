import { cn } from "@/lib/utils";

type DoodleProps = {
  className?: string;
  color?: string;
  size?: number;
};

/** Traits en éventail dessinés à la main. Animés en boucle par PageMotion. */
export function Burst({ className, color = "#000", size = 36, flip = false }: DoodleProps & { flip?: boolean }) {
  return (
    <svg
      data-float="burst"
      className={cn("pointer-events-none absolute", className)}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {flip ? (
        <>
          <path d="M34 30 L26 24" />
          <path d="M26 10 L21 18" />
          <path d="M10 6 L12 16" />
        </>
      ) : (
        <>
          <path d="M6 30 L14 24" />
          <path d="M14 10 L19 18" />
          <path d="M30 6 L28 16" />
        </>
      )}
    </svg>
  );
}

/** Étoile pleine à quatre branches. */
export function Star({ className, color = "#000", size = 28 }: DoodleProps) {
  return (
    <svg
      data-float="star"
      className={cn("pointer-events-none absolute", className)}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <path d="M20 2 C21 13 24 17 38 20 C24 23 21 27 20 38 C19 27 16 23 2 20 C16 17 19 13 20 2 Z" fill={color} />
    </svg>
  );
}

/** Vague soulignée. */
export function Squiggle({ className, color = "#000", width = 110 }: Omit<DoodleProps, "size"> & { width?: number }) {
  return (
    <svg
      data-float="squiggle"
      className={cn("pointer-events-none absolute", className)}
      width={width}
      height={16}
      viewBox="0 0 110 16"
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10 C12 2 18 2 25 9 S40 15 48 8 S63 1 71 8 S86 15 94 8 S104 4 107 6" />
    </svg>
  );
}

/** Flèche courbe. */
export function CurlyArrow({ className, color = "#000", size = 56 }: DoodleProps) {
  return (
    <svg
      data-float="arrow"
      className={cn("pointer-events-none absolute", className)}
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8 C10 30 24 44 48 46" />
      <path d="M38 38 L49 46 L39 54" />
    </svg>
  );
}
