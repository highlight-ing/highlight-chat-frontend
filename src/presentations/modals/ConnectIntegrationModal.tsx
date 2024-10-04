import { IntegrationType, ModalObjectProps } from '@/types'

import { useStore } from '@/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { getIntegrationLanguage } from '@/utils/integrations'
import Modal from '@/components/modals/Modal'

export interface ConnectIntegrationModalContext {
  type: IntegrationType
}

export default function ConnectIntegrationModal({ id, context }: ModalObjectProps) {
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
