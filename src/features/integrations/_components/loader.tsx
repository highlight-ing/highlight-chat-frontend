import { useEffect, useState } from 'react'

export function IntegrationsLoader() {
  const [text, setText] = useState('Loading...')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setText('Still loading...')
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  return <p className="mt-2 text-sm text-gray-500">{text}</p>
}
