import { ModalObjectProps } from '@/types'

import Modal from '@/components/modals/Modal'

import { IntegrationType } from '../types'
import { getIntegrationLanguage } from '../utils'

export interface ConnectIntegrationModalContext {
  type: IntegrationType
}

export function ConnectIntegrationModal({ id, context }: ModalObjectProps) {
  const { type } = context as ConnectIntegrationModalContext

  return (
    <Modal id={id} size="large">
      <div>
        <p>
          It looks like you don't have a connection to {getIntegrationLanguage(type)} yet. Would you like to connect
          your account?
        </p>
      </div>
    </Modal>
  )
}
