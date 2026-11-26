import type { ReactNode } from "react";

type MascotMood = "idle" | "welcome" | "focused" | "success" | "encouraging";

type MascotProps = {
  mood: MascotMood;
};

const Eye = ({ children }: { children?: ReactNode }) => (
  <g className="sr-mascot__eye">
    <ellipse cx="80" cy="111" rx="9" ry="12" fill="#22373A" />
    <circle cx="83" cy="107" r="3" fill="#FFFFFF" />
    {children}
  </g>
);

export const Mascot = ({ mood }: MascotProps) => (
  <svg
    className={`sr-mascot sr-mascot--${mood}`}
    viewBox="0 0 200 260"
    role="img"
    aria-label="Learning companion"
    focusable="false"
  >
    <ellipse className="sr-mascot__shadow" cx="100" cy="231" rx="68" ry="8" />
    <ellipse className="sr-mascot__halo" cx="100" cy="24" rx="32" ry="8" />
    <circle className="sr-mascot__spark sr-mascot__spark--one" cx="56" cy="14" r="3.5" />
    <circle className="sr-mascot__spark sr-mascot__spark--two" cx="150" cy="10" r="2.5" />
    <circle className="sr-mascot__spark sr-mascot__spark--three" cx="144" cy="28" r="2" />
    <ellipse className="sr-mascot__foot" cx="70" cy="218" rx="24" ry="12" />
    <ellipse className="sr-mascot__foot" cx="130" cy="218" rx="24" ry="12" />
    <path className="sr-mascot__body" d="M100 40 C150 40 178 90 176 140 C175 190 160 214 130 214 L70 214 C40 214 25 190 24 140 C22 90 50 40 100 40Z" />
    <circle cx="100" cy="187" r="12" fill="#FFFFFF" opacity="0.18" />
    <circle cx="100" cy="187" r="5" fill="#FFFFFF" opacity="0.28" />
    <ellipse className="sr-mascot__arm sr-mascot__arm--left" cx="22" cy="153" rx="12" ry="21" transform="rotate(15 22 153)" />
    <ellipse className="sr-mascot__arm sr-mascot__arm--right" cx="178" cy="153" rx="12" ry="21" transform="rotate(-15 178 153)" />
    <circle className="sr-mascot__face" cx="100" cy="108" r="50" />
    <ellipse cx="64" cy="54" rx="15" ry="7" transform="rotate(-30 64 54)" fill="#FFFFFF" opacity="0.26" />
    <g className="sr-mascot__eyes">
      <Eye />
      <g transform="translate(40 0)"><Eye /></g>
    </g>
    <ellipse className="sr-mascot__blush" cx="65" cy="125" rx="8" ry="5.5" />
    <ellipse className="sr-mascot__blush" cx="135" cy="125" rx="8" ry="5.5" />
    <path className="sr-mascot__mouth" d="M90 122 Q100 136 110 122" />
    <path className="sr-mascot__smile" d="M91 124 Q100 138 109 124 Q100 130 91 124Z" />
    <text className="sr-mascot__badge" x="100" y="262" textAnchor="middle">SR</text>
  </svg>
);
