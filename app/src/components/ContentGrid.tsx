import type { ReactNode } from "react";
import { MotionReveal } from "./MotionReveal";
import { SectionHeading } from "./SectionHeading";

type ContentGridProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  columns?: string;
  headerActions?: ReactNode;
};

export const ContentGrid = ({
  id,
  eyebrow,
  title,
  description,
  children,
  columns = "md:grid-cols-2 xl:grid-cols-3",
  headerActions
}: ContentGridProps) => (
  <section id={id} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <SectionHeading eyebrow={eyebrow} title={title} description={description} />
    {headerActions}
    <div className={`mt-12 grid items-stretch gap-5 ${columns}`}>
      {children}
    </div>
  </section>
);
