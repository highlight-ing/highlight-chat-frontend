export interface FeedbackTextareaProps {
  feedbackDetails: string | null
  setFeedbackDetails: (feedbackDetails: string | null) => void
}

function FeedbackTextarea({ feedbackDetails, setFeedbackDetails }: FeedbackTextareaProps) {
  return (
    <>
      {' '}
      <h5 className="text-sm font-medium text-gray-200">Please provide details: (optional)</h5>
      <textarea
        value={feedbackDetails ?? ''}
        onChange={(e) => setFeedbackDetails(e.target.value || null)}
        placeholder="Please provide additional details..."
        className="w-full rounded-md border border-neutral-800 bg-neutral-800 p-2 text-sm text-white"
      />
    </>
  )
}

export default FeedbackTextarea
