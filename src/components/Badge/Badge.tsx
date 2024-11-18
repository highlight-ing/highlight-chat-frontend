import * as React from 'react'

import styles from './badge.module.scss'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  style?: React.CSSProperties
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'disabled'
  disabled?: boolean
}

function Badge({ className, variant = 'default', hidden = false, disabled = false, style, ...props }: BadgeProps) {
  const badgeClassName = `${styles.badge} ${styles[variant]} ${className || ''} ${hidden ? styles.hidden : ''} ${disabled ? styles.disabled : ''}`
  return <div className={badgeClassName} style={style} {...props} />
}

export { Badge }
