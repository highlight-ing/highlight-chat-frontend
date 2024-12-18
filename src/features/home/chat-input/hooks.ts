'use client'

import React from 'react'
import { Attachment as AttachmentType, isFileAttachmentType, PinnedPrompt } from '@/types'
import { useSetAtom } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { trackEvent } from '@/utils/amplitude'
import usePromptApps from '@/hooks/usePromptApps'
import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import { useStore } from '@/components/providers/store-provider'

import { chatInputIsFocusedAtom } from '../atoms'

export function useUniquePinnedPrompts() {
  const { isPinnedPromptsLoading, pinnedPrompts } = usePromptApps()

  const uniquePrompts = pinnedPrompts.reduce((acc: Array<PinnedPrompt>, curr) => {
    const externalIds = acc.map((prompt) => prompt.external_id)
    if (!externalIds.includes(curr.external_id)) acc.push(curr)
    else console.log('Duplicate prompt found:', curr.external_id)

    return acc
  }, [])

  return { isPinnedPromptsLoading, uniquePrompts }
}

export function useChatInput() {
  const { inputOverride, setInputOverride, inputIsDisabled, promptApp, removeAttachment, fileInputRef } = useStore(
    useShallow((state) => ({
      inputIsDisabled: state.inputIsDisabled,
      inputOverride: state.inputOverride,
      setInputOverride: state.setInputOverride,
      promptApp: state.promptApp,
      removeAttachment: state.removeAttachment,
      fileInputRef: state.fileInputRef,
    })),
  )
  const { handleSubmit } = useSubmitQuery()
  const [input, setInput] = React.useState('')
  const setIsInputFocused = useSetAtom(chatInputIsFocusedAtom)

  let inputContainerRef = React.useRef<HTMLDivElement>(null)
  let inputRef = React.useRef<HTMLTextAreaElement>(null)
  const MAX_INPUT_HEIGHT = 160

  // Use to handle the auto closing when the window is focused
  // and to prevent toggling the input focus when pressing a dropdown
  React.useEffect(() => {
    const onInputFocus = () => {
      setIsInputFocused(true)
    }

    const inputElement = inputRef.current

    if (inputElement) {
      inputElement.addEventListener('focus', onInputFocus)
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', onInputFocus)
      }
    }
  }, [inputRef, setIsInputFocused])

  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsInputFocused(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [inputRef, setIsInputFocused])

  // Handle textarea on multi-row input
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '24px'
      const scrollHeight = inputRef.current.scrollHeight

      const newHeight = scrollHeight > MAX_INPUT_HEIGHT ? MAX_INPUT_HEIGHT : scrollHeight
      inputRef.current.style.height = newHeight + 'px'
    }
  }, [inputRef, input])

  // Handle input override
  React.useEffect(() => {
    if (inputOverride && inputOverride?.length > 0 && input !== inputOverride) {
      setInput(inputOverride)
      setInputOverride(null)
    }
  }, [input, inputOverride, setInputOverride])

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputIsDisabled && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input, promptApp)
      setInput('')
    }
  }

  const focusInput = () => {
    inputRef.current?.focus()
    trackEvent('HL Chat Input Focused', {})
  }

  const onRemoveAttachment = (attachment: AttachmentType) => {
    if (isFileAttachmentType(attachment.type) && fileInputRef?.current) {
      fileInputRef.current.value = ''
    }

    removeAttachment(attachment)
    trackEvent('HL Chat Attachment Removed', { type: attachment.type })
  }

  return {
    inputRef,
    inputContainerRef,
    input,
    setInput,
    handleKeyDown,
    focusInput,
    onRemoveAttachment,
  }
}
