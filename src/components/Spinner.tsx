import React from 'react'

export interface SpinnerProps {
  size: 'small' | 'medium' | 'large'
}

const Spinner = ({ size = 'medium' }: SpinnerProps) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`border-light-60 ${sizeClasses[size]} animate-spin rounded-full border-2 border-t-light`} />
    </div>
  )
}

export default Spinner
