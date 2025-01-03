import React from 'react'

import styles from './loadingspinner.module.scss'

interface LoadingSpinnerProps {
  color?: string
  size: string
  style?: React.CSSProperties
  hidden?: boolean
}

const LoadingSpinner = ({ size = '25px', color, style, hidden }: LoadingSpinnerProps) => {
  return (
    <div
      className={styles.loadingSpinner}
      style={{ ...style, '--size': size, '--color': color } as React.CSSProperties}
      hidden={hidden}
    />
  )
}

export default LoadingSpinner
