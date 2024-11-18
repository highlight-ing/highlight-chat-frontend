'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'

import { cn } from '@/lib/utils'

type StackerItemProps = {
  index: number
  children: React.ReactNode
  className?: string
}

const stackerItemVariants: Variants = {
  idle: (index: number) => ({
    scale: 1 - index ** 1.4 * 0.04,
    y: -1 * (index ** 1.4 * 20),
    zIndex: 1 - index,
    opacity: 1 - index * 0.3,
  }),
  hover: {
    scale: 1,
    y: 0,
    opacity: 1,
  },
}

export function StackerItem(props: StackerItemProps) {
  return (
    <motion.div variants={stackerItemVariants} custom={props.index} className={cn(props.className)}>
      {props.children}
    </motion.div>
  )
}

type StackerProps = {
  children: React.ReactNode
  side?: 'top' | 'bottom'
  className?: string
}

export function Stacker({ side = 'bottom', ...props }: StackerProps) {
  return (
    <motion.div initial="idle" whileHover="hover" className={cn('group isolate flex flex-col gap-3', props.className)}>
      {props.children}
    </motion.div>
  )
}
