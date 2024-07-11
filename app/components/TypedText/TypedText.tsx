import { useEffect, useRef, useState } from 'react'
import styles from './typed-text.module.scss'

interface TypedTextProps {
  text: string
  cursor?: boolean
  delay?: number
  speed?: number
  onClick?: (e: React.MouseEvent) => void
  onComplete?: () => void
  onReset?: () => void
}
const TypedText = ({ text, cursor = false, delay, speed = 1, onClick, onComplete, onReset }: TypedTextProps) => {
  const [isTyping, setIsTyping] = useState(false)
  const [visibleCharacters, setVisibleCharacters] = useState(0)
  const [showCursor, setShowCursor] = useState(!!cursor)
  const delayRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const cursorIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (typeof onReset === 'function') {
      onReset()
    }
    setVisibleCharacters(0)
  }, [text])

  useEffect(() => {
    if (!cursor && showCursor) {
      setShowCursor(false)
      return
    }
    if (cursorIntervalRef.current) {
      clearTimeout(cursorIntervalRef.current)
      cursorIntervalRef.current = undefined
    }
    if (visibleCharacters === text.length) {
      cursorIntervalRef.current = setTimeout(() => {
        setShowCursor(!showCursor)
      }, 500)
    }
    return () => {
      if (cursorIntervalRef.current) {
        clearTimeout(cursorIntervalRef.current)
        cursorIntervalRef.current = undefined
      }
    }
  }, [visibleCharacters, showCursor, cursor])

  useEffect(() => {
    if (!isTyping) {
      delayRef.current = setTimeout(() => {
        setIsTyping(true)
      }, delay)
      return
    }

    intervalRef.current = setInterval(() => {
      if (visibleCharacters < text.length) {
        setVisibleCharacters(Math.min(visibleCharacters + 1, text.length))
      } else {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
        if (typeof onComplete === 'function') {
          onComplete()
        }
      }
    }, 40 / speed)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [isTyping, visibleCharacters])

  return (
    <span className={styles.shadowText}>
      {text}
      <span className={styles.visibleText} onClick={onClick}>
        {text.substring(0, visibleCharacters)}
        {cursor !== false && (visibleCharacters < text.length || showCursor) && visibleCharacters > 0 && (
          <div className={styles.cursor}>|</div>
        )}
      </span>
    </span>
  )
}

export default TypedText
