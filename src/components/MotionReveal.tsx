import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

type MotionRevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  y?: number;
}>;

export const MotionReveal = ({ children, className, delay = 0, y = 24 }: MotionRevealProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};
