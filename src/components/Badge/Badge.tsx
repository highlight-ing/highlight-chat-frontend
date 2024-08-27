import * as React from 'react'
import styles from './badge.module.scss'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', hidden = false, ...props }: BadgeProps) {
  const badgeClassName = `${styles.badge} ${styles[variant]} ${className || ''} ${hidden ? styles.hidden : ''}`
  return <div className={badgeClassName} {...props} />
}

export { Badge }
