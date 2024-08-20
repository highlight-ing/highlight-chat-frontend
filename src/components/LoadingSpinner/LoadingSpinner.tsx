import React from 'react'
import styles from './loadingspinner.module.scss'

interface LoadingSpinnerProps {
  color?: string
  size: string
  style?: React.CSSProperties
}

const LoadingSpinner = ({ size = '25px', color, style }: LoadingSpinnerProps) => {
  // @ts-ignore
  return <div className={styles.loadingSpinner} style={{ ...style, '--size': size, '--color': color }} />
}

export default LoadingSpinner
