import type { ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";

type ContentGridProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  columns?: string;
};

export const ContentGrid = ({
  id,
  eyebrow,
  title,
  description,
  children,
  columns = "md:grid-cols-2 xl:grid-cols-3"
}: ContentGridProps) => (
  <section id={id} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <SectionHeading eyebrow={eyebrow} title={title} description={description} />
    <div className={`mt-12 grid gap-5 ${columns}`}>{children}</div>
  </section>
);
