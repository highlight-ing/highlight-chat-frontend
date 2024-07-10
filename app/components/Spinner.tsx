import React from 'react'

interface SpinnerProps {
  size?: number
}

const Spinner = ({ size = 32 }: SpinnerProps) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`border-light-60 h-[${size + 'px'}] w-[${size + 'px'}] animate-spin rounded-full border-2
        border-t-light`}
      />
    </div>
  )
}

export default Spinner
