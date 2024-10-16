import React, { type PropsWithChildren, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'
import { Message } from '@/types'
import { useStore } from '@/providers/store-provider'
import { z } from 'zod'
import client from '@/utils/api-client'
import useAuth from '@/hooks/useAuth'

// Components
import Button from '@/components/Button/Button'
import Modal from '@/components/modals/Modal'
import FeedbackTypeSelect from '@/components/Feedback/FeedbackTypeSelect'
import FeedbackRatingButtons from '@/components/Feedback/FeedbackRatingButtons'
import FeedbackTextarea from '@/components/Feedback/FeedbackTextarea'
import FeedbackDisclosure from '@/components/Feedback/FeedbackDisclosure'

export interface SendFeedbackModalProps {
  id: string
  header?: string
  message: Message
  rating: string
}

const Rating = z.number().int().min(-1).max(1)
const FeedbackNegativeType = z.enum([
  'other',
  'ui-bug',
  'harmful-content',
  'overactive-refusal',
  'did-not-follow-instructions',
  'not-factually-accurate',
])

const FeedbackPositiveType = z.enum([
  'other',
  'helpful-content',
  'accurate-response',
  'clear-explanation',
  'creative-solution',
  'time-saving',
  'learned-something-new',
  'improved-understanding',
])

const FeedbackDetails = z.string().max(1000).nullable()

const SendFeedbackModal = ({
  id,
  header,
  message,
  rating: initialRating,
}: PropsWithChildren<SendFeedbackModalProps>) => {
  const closeModal = useStore((state) => state.closeModal)
  const addToast = useStore((state) => state.addToast)
  const getConversationMessages = useStore((state) => state.getConversationMessages)
  const updateConversationMessages = useStore((state) => state.updateConversationMessages)
  const [isLoading, setIsLoading] = useState(false)
  const { getAccessToken } = useAuth()
  const [rating, setRating] = useState<z.infer<typeof Rating>>(
    initialRating === 'like' ? 1 : initialRating === 'dislike' ? -1 : 0,
  )
  const [feedbackType, setFeedbackType] =
    useState<z.infer<typeof FeedbackNegativeType | typeof FeedbackPositiveType>>('other')
  const [feedbackDetails, setFeedbackDetails] = useState<z.infer<typeof FeedbackDetails>>('')

  const handleCloseModal = (e: any) => {
    e.stopPropagation()
    closeModal('send-feedback')
    trackEvent('HL Chat Send Feedback Modal Action', { modalId: id, action: 'cancel' })
  }

  const handleSendFeedback = async (e: any) => {
    e.stopPropagation()
    setIsLoading(true)
    const feedbackData = {
      rating,
      feedback: feedbackDetails ?? '',
      feedback_type: feedbackType,
      conversation_id: message.conversation_id,
      message_id: message.id,
    }
    try {
      const { data, error } = await client.POST('/api/v2/feedback/add', {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: feedbackData,
      })
      if (error) {
        console.error('Error submitting feedback:', error)
        addToast({
          title: 'Error Submitting Feedback',
          subtext: 'Please try again later.',
          description: 'There was an error submitting your feedback. Please try again later.',
          type: 'error',
        })
      }
      if (data) {
        setIsLoading(false)
        // get all messages for this conversation
        const allMessages = getConversationMessages(message.conversation_id)

        if (!allMessages) {
          return
        }

        // Update the given_feedback for the specific message
        const updatedMessages = allMessages?.map((msg) =>
          msg.id === message.id ? { ...msg, given_feedback: data.external_id } : msg,
        )

        // Update the conversation messages in the store
        updateConversationMessages(message.conversation_id, updatedMessages)

        closeModal('send-feedback')

        addToast({
          title: 'Feedback Successfully Updated',
          subtext: 'Thank you for your feedback!',
          description: 'We will review your feedback and use it to improve our product.',
          type: 'success',
        })

        trackEvent('HL Chat Send Feedback Modal Action', {
          action: 'add',
          modalId: id,
          rating: rating,
          feedbackType: feedbackType,
          feedbackDetails: feedbackDetails,
          messageId: message.id,
          conversationId: message.conversation_id,
        })
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Error submitting feedback:', error)
      addToast({
        title: 'Error Submitting Feedback',
        subtext: 'Please try again later.',
        description: 'There was an error submitting your feedback. Please try again later.',
        type: 'error',
      })
    }
  }

  return (
    <Modal id={id} size={'small'} header={header ?? 'Give Feedback'}>
      <div className="left-0 flex flex-col justify-start gap-4">
        <div className="flex flex-col gap-2">
          <FeedbackRatingButtons rating={rating} setRating={setRating} />
          <FeedbackTypeSelect rating={rating} feedbackType={feedbackType} setFeedbackType={setFeedbackType} />
          <FeedbackTextarea feedbackDetails={feedbackDetails} setFeedbackDetails={setFeedbackDetails} />
          <FeedbackDisclosure />
        </div>
      </div>
      <div className="flex w-full justify-end gap-4">
        <Button size={'medium'} variant={'ghost-neutral'} onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button size={'medium'} variant={'primary'} onClick={handleSendFeedback} disabled={isLoading}>
          Send Feedback
        </Button>
      </div>
    </Modal>
  )
}

export default SendFeedbackModal
