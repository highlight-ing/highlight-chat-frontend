import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { useEffect, useState } from 'react'

export function IntegrationsLoader() {
  const [text, setText] = useState('Loading...')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setText('Almost there...')
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="16px" />
      <p className="text-primary">{text}</p>
    </div>
  )
}
