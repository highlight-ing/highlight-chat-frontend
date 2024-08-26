import React from 'react'

const shareButtonClass =
  'px-4 py-[6px] inline-flex items-center border border-border-tertiary rounded-[10px] text-xs font-medium text-text-secondary hover:text-text-primary hover:border-primary transition-colors transition-border duration-300 ease-in-out'

const ShareHeaderButtonLinks: React.FC = () => {
  return (
    <div className="flex space-x-3">
      <a href="https://highlight.ing/apps" target="_blank" rel="noopener noreferrer" className={shareButtonClass}>
        Explore Apps
      </a>
      <a href="https://highlight.ing/" target="_blank" rel="noopener noreferrer" className={shareButtonClass}>
        Learn More
      </a>
    </div>
  )
}

export default ShareHeaderButtonLinks
