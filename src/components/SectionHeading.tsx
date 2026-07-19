import { MotionReveal } from "./MotionReveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export const SectionHeading = ({ eyebrow, title, description }: SectionHeadingProps) => (
  <MotionReveal className="max-w-2xl">
    <span className="inline-flex rounded-full border border-accent/20 bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
      {eyebrow}
    </span>
    <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
      {title}
    </h2>
    <p className="mt-4 text-base leading-7 text-muted sm:text-lg">{description}</p>
  </MotionReveal>
);
