'use client'

import React, {Fragment, useEffect} from "react";
import DeleteChatModal from "@/presentations/modals/DeleteChatModal";
import {useStore} from "@/providers/store-provider";
import {ModalObjectProps} from "@/types";

type FunctionalComponent = (props: ModalObjectProps) => JSX.Element

// Register the modal components by ID here
const ModalMap: Record<string, FunctionalComponent> = {
  'delete-chat': DeleteChatModal
}

export const ModalContainer = () => {
  const { modals, openModal, closeModal } = useStore((state) => state)

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
