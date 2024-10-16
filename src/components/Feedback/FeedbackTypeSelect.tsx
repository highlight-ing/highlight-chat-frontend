import React, { useMemo } from 'react'
import { z } from 'zod'

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

type FeedbackType = z.infer<typeof FeedbackNegativeType | typeof FeedbackPositiveType>

interface FeedbackTypeSelectProps {
  rating: number
  feedbackType: FeedbackType
  setFeedbackType: (type: FeedbackType) => void
}

const FeedbackTypeSelect: React.FC<FeedbackTypeSelectProps> = ({ rating, feedbackType, setFeedbackType }) => {
  const feedbackOptions = useMemo(() => {
    if (rating === 1) {
      return [
        { value: 'other', label: 'Other' },
        { value: 'helpful-content', label: 'Helpful Content' },
        { value: 'accurate-response', label: 'Accurate Response' },
        { value: 'clear-explanation', label: 'Clear Explanation' },
        { value: 'creative-solution', label: 'Creative Solution' },
        { value: 'time-saving', label: 'Time Saving' },
        { value: 'learned-something-new', label: 'Learned Something New' },
        { value: 'improved-understanding', label: 'Improved Understanding' },
      ]
    } else if (rating === -1) {
      return [
        { value: 'other', label: 'Other' },
        { value: 'ui-bug', label: 'UI Bug' },
        { value: 'harmful-content', label: 'Harmful Content' },
        { value: 'overactive-refusal', label: 'Overactive Refusal' },
        { value: 'did-not-follow-instructions', label: 'Did not follow instructions' },
        { value: 'not-factually-accurate', label: 'Not factually accurate' },
      ]
    } else {
      return [{ value: 'other', label: 'Other' }]
    }
  }, [rating])

  return (
    <div className="flex flex-col gap-1">
      <h5 className="text-sm font-medium text-gray-200">What type of feedback do you wish to provide? (optional)</h5>
      <select
        className="w-full rounded-md border border-neutral-800 bg-neutral-800 p-2 text-sm text-white"
        value={feedbackType}
        onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
      >
        {feedbackOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FeedbackTypeSelect
