import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Button from '@/components/Button/Button'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'

type IntegrationSubmitButtonProps = {
  icon: React.ReactNode
  label: string
  isPending?: boolean
}

export function IntegrationSubmitButton(props: IntegrationSubmitButtonProps) {
  return (
    <Button
      size={'medium'}
      variant={'accent'}
      type={'submit'}
      disabled={props.isPending}
      style={{ gap: 8, width: '100%' }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={props.isPending ? 'true' : 'false'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          {props.isPending ? (
            <LoadingSpinner size={'20px'} />
          ) : (
            <div className="size-5 overflow-hidden rounded-md">{props.icon}</div>
          )}
        </motion.span>
      </AnimatePresence>
      {props.label}
    </Button>
  )
}
