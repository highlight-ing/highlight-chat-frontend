import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

export function InputDivider({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('w-full border-t border-[#191919]', className)}
    />
  )
}
