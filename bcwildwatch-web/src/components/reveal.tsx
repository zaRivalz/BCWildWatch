'use client';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Subtle fade-up entrance for content as it scrolls into view. Respects the
 * user's prefers-reduced-motion setting by rendering a plain wrapper.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
