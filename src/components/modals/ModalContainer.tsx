'use client'

import React, { Fragment, useEffect } from 'react'
import ChangePromptVisibilityModal from '@/presentations/modals/ChangePromptVisibilityModal'
import ConfirmDeletePromptModal from '@/presentations/modals/ConfirmDeletePromptModal'
import ConfirmOverridePrompt from '@/presentations/modals/ConfirmOverridePrompt'
import CreatePromptFromTemplateModal from '@/presentations/modals/CreatePromptFromTemplate'
import CreatePromptModal from '@/presentations/modals/CreatePromptModal'
import CustomizePromptModal from '@/presentations/modals/CustomizePromptModal'
import DeleteChatModal from '@/presentations/modals/DeleteChatModal'
import EditPromptModal from '@/presentations/modals/EditPromptModal'
import PinPromptModal from '@/presentations/modals/PinPromptModal'
import PromptAddedModal from '@/presentations/modals/PromptAddedModal'
import PromptsModal from '@/presentations/modals/PromptsModal'
import SendFeedbackModal, { SendFeedbackModalProps } from '@/presentations/modals/SendFeedbackModal'
import UnpinPromptModal from '@/presentations/modals/UnpinPromptModal'
import UnsavedChangesModal from '@/presentations/modals/UnsavedChangesModal'
import UpdateFeedbackModal, { UpdateFeedbackModalProps } from '@/presentations/modals/UpdateFeedbackModal'
import { ModalObjectProps } from '@/types'
import { useShallow } from 'zustand/react/shallow'

import ConfirmationModal, { ConfirmationModalProps } from '@/components/modals/ConfirmationModal'
import { useStore } from '@/components/providers/store-provider'

import { ConnectIntegrationModal } from '@/features/integrations/_components/connect-integration-modal'

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
  'confirm-override-prompt': ConfirmOverridePrompt,
  'prompt-added': PromptAddedModal,
  'customize-prompt': CustomizePromptModal,
  'create-prompt-from-template': CreatePromptFromTemplateModal,
  'unsaved-changes': UnsavedChangesModal,
  'connect-integration': ConnectIntegrationModal,
  'send-feedback': ({ context }: ModalObjectProps) => <SendFeedbackModal {...(context as SendFeedbackModalProps)} />,
  'update-feedback': ({ context }: ModalObjectProps) => (
    <UpdateFeedbackModal {...(context as UpdateFeedbackModalProps)} />
  ),
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
