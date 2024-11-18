import { Dislike, Like1 } from 'iconsax-react'
import { z } from 'zod'

const Rating = z.number().int().min(-1).max(1)

export interface FeedbackRatingButtonsProps {
  rating: number
  setRating: (rating: number) => void
}

function FeedbackRatingButtons({ rating, setRating }: FeedbackRatingButtonsProps) {
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
        return ''
    }
  }
  return (
    <>
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
          style={buttonStyle(1)}
          onClick={() => setRating(1)}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4ade80')} // green-400
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rating === 1 ? '#22c55e' : '')}
        >
          <Like1 size={24} color={'white'} />
        </button>
      </div>
    </>
  )
}

export default FeedbackRatingButtons
