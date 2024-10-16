function FeedbackDisclosure() {
  return (
    <>
      <p className="text-xs text-gray-400">
        Submitting this feedback will send the current conversation to Highlight and store it with your feedback for
        future improvements to our models. We anonymize your inputs and outputs from your conversation and user ID to
        use them for training and improving our experience.{' '}
      </p>
      <a className="text-xs text-blue-600 underline" href="https://highlightai.com/privacy" target="_blank">
        Learn More
      </a>
    </>
  )
}

export default FeedbackDisclosure
