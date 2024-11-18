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
    scale: 1 - 0.04 * index,
    y: -(index ** 1.2 * 20),
    zIndex: 1 - index,
  }),
  hover: {
    scale: 1,
    y: 0,
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
