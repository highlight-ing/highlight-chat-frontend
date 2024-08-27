import React from 'react'
import { HighlightIcon } from '@/icons/icons'

export default function GetHighlightCTA() {
  return (
    <div className="fixed bottom-4 left-0 right-4 mx-auto w-full max-w-[712px]">
      <div className="flex items-center justify-between rounded-[20px] border border-light-10 bg-background-secondary p-3">
        <div className="flex-shrink-0">
          <HighlightIcon size={24} color="white" />
        </div>
        <p className="font-base mx-3 flex-grow truncate text-center text-[16px] text-text-tertiary">
          Highlight is your personal AI for getting answers and doing work
        </p>
        <button className="duration-250 flex-shrink-0 whitespace-nowrap rounded-[8px] bg-primary px-3 py-1.5 text-xs font-bold text-text-black transition-all ease-in-out hover:bg-primary-60">
          Get Highlight
        </button>
      </div>
    </div>
  )
}
