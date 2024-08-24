import React from 'react'
import '@/styles/components.css'

const ShareHeaderButtonLinks: React.FC = () => {
  return (
    <div className="flex space-x-3">
      <a href="https://highlight.ing/apps" target="_blank" rel="noopener noreferrer" className="share-button">
        Explore Apps
      </a>
      <a href="https://highlight.ing/" target="_blank" rel="noopener noreferrer" className="share-button">
        Learn More
      </a>
    </div>
  )
}

export default ShareHeaderButtonLinks
