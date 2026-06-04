'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-10 text-center"
    >
      <h1 className="text-3xl font-bold text-green-800 dark:text-green-300">Keep campus safe &amp; wild</h1>
      <p className="mt-2 text-muted-foreground">Spotted a dangerous or nuisance animal? Let us know.</p>
      <Button render={<Link href="/report" />} className="mt-6">Report a Sighting</Button>
    </motion.section>
  );
}
