import { PropsWithChildren } from 'react'

import { useStore } from '@/components/providers/store-provider'

import type { ModalProps } from './BaseModal'
import BaseModal from './BaseModal'

const Modal = (props: PropsWithChildren<ModalProps>) => {
  const closeModal = useStore((state) => state.closeModal)
  return (
    <BaseModal {...props} closeModal={closeModal}>
      {props.children}
    </BaseModal>
  )
}

export default Modal
