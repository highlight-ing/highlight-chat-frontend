import { motion } from 'framer-motion'

export function InputDivider() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full border-t border-[#191919]"
    />
  )
}
