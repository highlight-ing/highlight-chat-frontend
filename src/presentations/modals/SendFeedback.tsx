import styles from '@/presentations/modals/modals.module.scss'
import Button from '@/components/Button/Button'
import Modal from '@/components/modals/Modal'
import React, { type PropsWithChildren } from 'react'
import { trackEvent } from '@/utils/amplitude'
import { Message } from '@/types'
import { useStore } from '@/providers/store-provider'
import { useState } from 'react'
import { z } from 'zod'
import { Dislike, Like1, LikeDislike } from 'iconsax-react'
import client from '@/utils/api-client'
import useAuth from '@/hooks/useAuth'

export interface SendFeedbackModalProps {
  id: string
  header?: string
  message: Message
}

const Rating = z.number().int().min(-1).max(1)
const FeedbackType = z.enum([
  'other',
  'ui-bug',
  'harmful-content',
  'overactive-refusal',
  'did-not-follow-instructions',
  'not-factually-accurate',
])
const FeedbackDetails = z.string().max(1000).nullable()

const SendFeedbackModal = ({ id, header, message }: PropsWithChildren<SendFeedbackModalProps>) => {
  const closeModal = useStore((state) => state.closeModal)
  const addToast = useStore((state) => state.addToast)
  const { getAccessToken } = useAuth()
  const [rating, setRating] = useState<z.infer<typeof Rating>>(0)
  const [feedbackType, setFeedbackType] = useState<z.infer<typeof FeedbackType>>('other')
  const [feedbackDetails, setFeedbackDetails] = useState<z.infer<typeof FeedbackDetails>>('')

  const handleCloseModal = (e: any) => {
    e.stopPropagation()
    closeModal('send-feedback')
    trackEvent('HL Chat Send Feedback Modal Action', { modalId: id, action: 'cancel' })
  }

  const handleSendFeedback = async (e: any) => {
    e.stopPropagation()
    try {
      const feedbackData = {
        rating,
        feedback: feedbackDetails ?? '',
        feedback_type: feedbackType,
        conversation_id: message.conversation_id,
        message_id: message.id,
      }

      const response = await client.POST('/api/v2/feedback/add', {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: feedbackData,
      })
      console.log(response)
      closeModal('send-feedback')

      addToast({
        title: 'Feedback Successfully Submitted',
        subtext: 'Thank you for your feedback!',
        description: 'We will review your feedback and use it to improve our product.',
        type: 'success',
      })

      trackEvent('HL Chat Send Feedback Modal Action', {
        modalId: id,
        rating: rating,
        feedbackType: feedbackType,
        feedbackDetails: feedbackDetails,
        messageId: message.id,
        conversationId: message.conversation_id,
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
      addToast({
        title: 'Error Submitting Feedback',
        subtext: 'Please try again later.',
        description: 'There was an error submitting your feedback. Please try again later.',
        type: 'error',
      })
    }
  }

  const buttonStyle = (buttonRating: z.infer<typeof Rating>) => ({
    borderRadius: '50%',
    padding: '10px',
    border: '1px solid #e5e5e5',
    backgroundColor: rating === buttonRating ? getBackgroundColor(buttonRating) : '',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
  })

  const getBackgroundColor = (buttonRating: z.infer<typeof Rating>) => {
    switch (buttonRating) {
      case -1:
        return '#ef4444' // red-500
      case 0:
        return '#eab308' // yellow-500
      case 1:
        return '#22c55e' // green-500
      default:
        return '' // neutral-200
    }
  }

  return (
    <Modal id={id} size={'small'} header={header ?? 'Give Feedback'}>
      <div className="left-0 flex flex-col justify-start gap-4">
        <div className="flex flex-col gap-1">
          <h5 className="text-sm font-medium text-gray-200">Rating</h5>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              style={buttonStyle(-1)}
              onClick={() => setRating(-1)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f87171')} // red-400
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rating === -1 ? '#ef4444' : '')}
            >
              <Dislike size={24} color={'white'} />
            </button>
            <button
              style={buttonStyle(0)}
              onClick={() => setRating(0)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#facc15')} // yellow-400
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rating === 0 ? '#eab308' : '')}
            >
              <LikeDislike size={24} color={'white'} />
            </button>
            <button
              style={buttonStyle(1)}
              onClick={() => setRating(1)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4ade80')} // green-400
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rating === 1 ? '#22c55e' : '')}
            >
              <Like1 size={24} color={'white'} />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h5 className="text-sm font-medium text-gray-200">What type of issue do you wish to report? (optional)</h5>
          <select
            className="w-full rounded-md border border-neutral-800 bg-neutral-800 p-2 text-sm text-white"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value as z.infer<typeof FeedbackType>)}
          >
            <option value="other">Other</option>
            <option value="ui-bug">UI Bug</option>
            <option value="harmful-content">Harmful Content</option>
            <option value="overactive-refusal">Overactive Refusal</option>
            <option value="did-not-follow-instructions">Did not follow instructions</option>
            <option value="not-factually-accurate">Not factually accurate</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <h5 className="text-sm font-medium text-gray-200">Please provide details: (optional)</h5>
          <textarea
            value={feedbackDetails ?? ''}
            onChange={(e) => setFeedbackDetails(e.target.value || null)}
            placeholder="Details of your issue..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-800 p-2 text-sm text-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">
            Submitting this feedback will send the current conversation to Highlight and store it with your feedback for
            future improvements to our models. When you submit feedback and provide us permission, we disassociate
            inputs and outputs from your user ID to use them for training and improving our models.{' '}
          </p>
          <a className="text-xs text-blue-600 underline" href="https://highlightai.com/privacy" target="_blank">
            Learn More
          </a>
        </div>
      </div>
      <div className={styles.divider} />
      <div className="flex w-full justify-end gap-4">
        <Button size={'medium'} variant={'ghost-neutral'} onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button size={'medium'} variant={'primary'} onClick={handleSendFeedback}>
          Send Feedback
        </Button>
      </div>
    </Modal>
  )
}

export default SendFeedbackModal
