import React from 'react'

const DownloadCTA: React.FC = () => {
  return (
    <div className="mt-8 text-center">
      <h2 className="mb-2 text-xl font-semibold">Want to create your own conversations?</h2>
      <p className="mb-4">Download our app and start chatting!</p>
      <a
        href="/download" // Replace with your actual download link
        className="bg-primary hover:bg-primary-dark rounded px-4 py-2 font-bold text-white transition-colors"
      >
        Download Now
      </a>
    </div>
  )
}

export default DownloadCTA
