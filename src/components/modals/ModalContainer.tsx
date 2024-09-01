'use client'

import React, { Fragment, useEffect } from 'react'
import DeleteChatModal from '@/presentations/modals/DeleteChatModal'
import { useStore } from '@/providers/store-provider'
import { ModalObjectProps } from '@/types'
import PromptsModal from '@/presentations/modals/PromptsModal'
import CreatePromptModal from '@/presentations/modals/CreatePromptModal'
import EditPromptModal from '@/presentations/modals/EditPromptModal'
import ConfirmationModal, { ConfirmationModalProps } from '@/components/modals/ConfirmationModal'
import { useShallow } from 'zustand/react/shallow'
import ConfirmDeletePromptModal from '@/presentations/modals/ConfirmDeletePromptModal'
import ChangePromptVisibilityModal from '@/presentations/modals/ChangePromptVisibilityModal'
import UnpinPromptModal from '@/presentations/modals/UnpinPromptModal'
import PinPromptModal from '@/presentations/modals/PinPromptModal'

type FunctionalComponent = (props: ModalObjectProps) => JSX.Element

// Register the modal components by ID here
const ModalMap: Record<string, FunctionalComponent> = {
  'create-prompt': CreatePromptModal,
  'edit-prompt': EditPromptModal,
  'delete-chat': DeleteChatModal,
  'prompts-modal': PromptsModal,
  'confirmation-modal': ({ context }: ModalObjectProps) => (
    <ConfirmationModal {...(context as ConfirmationModalProps)} />
  ),
  'confirm-delete-prompt': ConfirmDeletePromptModal,
  'change-prompt-visibility': ChangePromptVisibilityModal,
  'unpin-prompt': UnpinPromptModal,
  'pin-prompt': PinPromptModal,
}

export const ModalContainer = () => {
  const { modals, openModal, closeModal } = useStore(
    useShallow((state) => ({
      modals: state.modals,
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      window._openModal = openModal
      // @ts-ignore
      window._closeModal = closeModal
    }
  }, [])

  return (
    <Fragment>
      {modals.map((modal) => (
        <Fragment key={modal.id}>{renderModal(modal)}</Fragment>
      ))}
    </Fragment>
  )
}

const renderModal = ({ id, context }: ModalObjectProps): React.ReactNode | null => {
  const ModalComponent = ModalMap[id]
  if (!ModalComponent) {
    console.warn('Unsupported modal id:', id)
    return null
  }
  return <ModalComponent id={id} context={context} />
}
