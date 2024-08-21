import { ReactElement, useEffect, useRef, useState } from 'react'
import styles from './animatedlabel.module.scss'

const AnimatedLabel = ({ label, transitionMs }: { label: string | ReactElement; transitionMs: number }) => {
  const [displayedLabel, setDisplayedLabel] = useState(label)
  const [transition, setTransition] = useState(false)
  const labelTimeoutRef = useRef<NodeJS.Timeout | null>()
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>()

  useEffect(() => {
    if (label !== displayedLabel) {
      setTransition(true)
    }
  }, [label])

  useEffect(() => {
    if (transition) {
      if (labelTimeoutRef.current) {
        clearTimeout(labelTimeoutRef.current)
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
      labelTimeoutRef.current = setTimeout(() => {
        setDisplayedLabel(label)
      }, transitionMs / 2)
      transitionTimeoutRef.current = setTimeout(() => {
        setTransition(false)
      }, transitionMs)
    }
  }, [label, transition])

  return (
    // @ts-ignore
    <div className={styles.label} style={{ '--transitionMs': transitionMs }}>
      {displayedLabel}
    </div>
  )
}

export default AnimatedLabel
