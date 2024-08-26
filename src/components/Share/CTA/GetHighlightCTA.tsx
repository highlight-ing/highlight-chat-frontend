import React from 'react'
import { HighlightIcon } from '@/icons/icons'

export default function GetHighlightCTA() {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[20px] border border-light-10 bg-background-secondary p-4">
      <div className="flex flex-grow items-center space-x-3 overflow-hidden">
        <HighlightIcon size={24} color="white" />
        <p className="truncate text-sm text-text-tertiary">
          Highlight is your personal AI for getting answers and doing work
        </p>
      </div>
      <button className="ml-4 whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-medium text-text-black">
        Get Highlight
      </button>
    </div>
  )
}
