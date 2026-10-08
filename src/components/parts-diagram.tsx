import type { ReactNode } from "react";

/* Outline drawings of the bought parts, one per tile. Every icon is 80 × 80. */

const parts: { name: string; icon: ReactNode }[] = [
  {
    name: "NEMA17 stepper ×2",
    icon: (
      <>
        <rect x="18" y="18" width="44" height="44" rx="3" />
        <circle cx="40" cy="40" r="11" />
        <circle cx="40" cy="40" r="3" />
        {[24, 56].flatMap((x) =>
          [24, 56].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.5" />),
        )}
      </>
    ),
  },
  {
    name: "Peristaltic pump",
    icon: (
      <>
        <rect x="20" y="22" width="40" height="40" rx="3" />
        <circle cx="40" cy="42" r="13" />
        {[0, 120, 240].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return <circle key={deg} cx={40 + 7 * Math.cos(a)} cy={42 + 7 * Math.sin(a)} r="2" />;
        })}
        <path d="M30 22 V12 M50 22 V12" className="stroke-water" />
      </>
    ),
  },
  {
    name: "Flow meter",
    icon: (
      <>
        <rect x="26" y="30" width="28" height="20" rx="2" />
        <path d="M10 40 H26 M54 40 H70" className="stroke-water" />
        <path d="M40 50 V62" />
      </>
    ),
  },
  {
    name: "ESP32 board",
    icon: (
      <>
        <rect x="24" y="12" width="32" height="56" rx="2" />
        <rect x="31" y="16" width="18" height="10" />
        {[34, 40, 46, 52, 58, 64].flatMap((y) => [
          <circle key={`l${y}`} cx="28" cy={y} r="1" />,
          <circle key={`r${y}`} cx="52" cy={y} r="1" />,
        ])}
      </>
    ),
  },
  {
    name: "DS18B20 probe",
    icon: (
      <>
        <rect x="37" y="10" width="6" height="34" rx="3" />
        <path d="M40 44 C40 60 22 56 22 70" />
      </>
    ),
  },
];

export function PartsDiagram() {
  return (
    <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      {parts.map((part) => (
        <li key={part.name} className="border-t border-rule pt-4">
          <svg
            viewBox="0 0 80 80"
            className="size-20 fill-none stroke-husk"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {part.icon}
          </svg>
          <p className="mt-2 font-mono text-sm text-husk">{part.name}</p>
        </li>
      ))}
    </ul>
  );
}
