import React, { useEffect, useState, type PropsWithChildren } from 'react'
import { Message } from '@/types'
import { z } from 'zod'

import { trackEvent } from '@/utils/amplitude'
import useAuth from '@/hooks/useAuth'
// Components
import Button from '@/components/Button/Button'
import FeedbackDisclosure from '@/components/Feedback/FeedbackDisclosure'
import FeedbackRatingButtons from '@/components/Feedback/FeedbackRatingButtons'
import FeedbackTextarea from '@/components/Feedback/FeedbackTextarea'
import FeedbackTypeSelect from '@/components/Feedback/FeedbackTypeSelect'
import Modal from '@/components/modals/Modal'
import { useStore } from '@/components/providers/store-provider'
import { backendUrl } from '@/utils/chatBackendUrl'

export interface UpdateFeedbackModalProps {
  id: string
  header?: string
  message: Message
  isOpen: boolean
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

const UpdateFeedbackModal = ({
  id,
  header,
  message,
  rating: initialRating,
}: PropsWithChildren<UpdateFeedbackModalProps>) => {
  const closeModal = useStore((state) => state.closeModal)
  const addToast = useStore((state) => state.addToast)
  const { getAccessToken } = useAuth()
  const getConversationMessages = useStore((state) => state.getConversationMessages)
  const updateConversationMessages = useStore((state) => state.updateConversationMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [rating, setRating] = useState<z.infer<typeof Rating>>(
    initialRating === 'like' ? 1 : initialRating === 'dislike' ? -1 : 0,
  )
  const [feedbackType, setFeedbackType] =
    useState<z.infer<typeof FeedbackNegativeType | typeof FeedbackPositiveType>>('other')
  const [feedbackDetails, setFeedbackDetails] = useState<z.infer<typeof FeedbackDetails>>('')

  const handleCloseModal = (e: any) => {
    e.stopPropagation()
    closeModal('update-feedback')
    trackEvent('HL Chat Update Feedback Modal Action', { modalId: id, action: 'cancel' })
  }

  useEffect(() => {
    if (message.given_feedback) {
      fetchFeedbackData()
    }
  }, [])

  const fetchFeedbackData = async () => {
    setIsFetching(true)
    try {

      const response = await fetch(`${backendUrl}/api/v4/feedback/${message.given_feedback}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      })
      
      const data = await response.json()
      if (response.ok) {
        console.error('Error fetching feedback data:', response)
        addToast({
          title: 'Error Fetching Feedback Data',
          subtext: 'Please try again later.',
          description: 'There was an error fetching your feedback data. Please try again later.',
          type: 'error',
        })
      }
      if (data) {
        setRating(initialRating === 'like' ? 1 : initialRating === 'dislike' ? -1 : 0)
        setFeedbackType(data.feedback_type as z.infer<typeof FeedbackNegativeType | typeof FeedbackPositiveType>)
        setFeedbackDetails(data.feedback)
      }
    } catch (error) {
      console.error('Error fetching feedback data:', error)
      addToast({
        title: 'Error Fetching Feedback Data',
        subtext: 'Please try again later.',
        description: 'There was an error fetching your feedback data. Please try again later.',
        type: 'error',
      })
    } finally {
      setIsFetching(false)
    }
  }

  const handleSendFeedback = async (e: any) => {
    e.stopPropagation()
    setIsLoading(true)
    const feedbackData = {
      rating,
      feedback: feedbackDetails ?? '',
      feedback_type: feedbackType
    }
    try {
      const response = await fetch(`${backendUrl}/api/v4/feedback/${message.given_feedback}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })
      if (response.ok) {
        console.error('Error submitting feedback:', response)
        addToast({
          title: 'Error Submitting Feedback',
          subtext: 'Please try again later.',
          description: 'There was an error submitting your feedback. Please try again later.',
          type: 'error',
        })
      }

      const data = await response.json()

      if (data) {
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

        closeModal('update-feedback')
        setIsLoading(false)

        addToast({
          title: 'Feedback Successfully Submitted',
          subtext: 'Thank you for your feedback!',
          description: 'We will review your feedback and use it to improve our product.',
          type: 'success',
        })

        trackEvent('HL Chat Update Feedback Modal Action', {
          action: 'update',
          modalId: id,
          rating: rating,
          feedbackType: feedbackType,
          feedbackDetails: feedbackDetails,
          messageId: message.id,
          conversationId: message.conversation_id,
        })
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setIsLoading(false)
      addToast({
        title: 'Error Submitting Feedback',
        subtext: 'Please try again later.',
        description: 'There was an error submitting your feedback. Please try again later.',
        type: 'error',
      })
    }
  }

  return (
    <Modal id={id} size={'small'} header={header ?? 'Update Feedback'} isLoading={isFetching}>
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

export default UpdateFeedbackModal
