import React, { type PropsWithChildren, type ReactElement } from 'react'
import styles from '@/presentations/modals/modals.module.scss'

import { trackEvent } from '@/utils/amplitude'
import Button, { ButtonVariantType } from '@/components/Button/Button'
import Modal from '@/components/modals/Modal'

export interface ConfirmationModalProps {
  header?: string
  id: string
  primaryAction: {
    label: ReactElement | string
    onClick: (e: React.MouseEvent) => void
    variant?: ButtonVariantType
  }
  secondaryAction?: {
    label: ReactElement | string
    onClick: (e: React.MouseEvent) => void
    variant?: ButtonVariantType
  }
}

const ConfirmationModal = ({
  children,
  id,
  header,
  primaryAction,
  secondaryAction,
}: PropsWithChildren<ConfirmationModalProps>) => {
  return (
    <Modal id={id} size={'small'} header={header ?? 'Are you sure?'} bodyClassName={styles.confirmationModal}>
      <div className="flex flex-col items-center gap-1">{children}</div>
      <div className={styles.divider} />
      <div className="flex gap-4">
        {secondaryAction && (
          <Button
            size={'medium'}
            variant={secondaryAction.variant ?? 'ghost-neutral'}
            onClick={(e) => {
              secondaryAction.onClick(e)
              trackEvent('HL Chat Confirmation Modal Action', { modalId: id, action: 'secondary' })
            }}
          >
            {secondaryAction.label}
          </Button>
        )}
        <Button
          size={'medium'}
          variant={primaryAction.variant ?? 'danger'}
          onClick={(e) => {
            primaryAction.onClick(e)
            trackEvent('HL Chat Confirmation Modal Action', { modalId: id, action: 'primary' })
          }}
        >
          {primaryAction.label}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmationModal
