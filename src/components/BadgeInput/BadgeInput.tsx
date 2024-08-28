import React from 'react'
import { Badge } from '@/components/Badge/Badge'
import styles from './badge-list.module.scss'

interface BadgeItem {
  id: string
  label: string
}

interface BadgeListProps {
  items: BadgeItem[]
  onItemClick?: (item: BadgeItem) => void
  onActionClick?: (action: string, item: BadgeItem) => void
}

export const BadgeList: React.FC<BadgeListProps> = ({ items, onItemClick, onActionClick }) => {
  return (
    <div className={styles.badgeList}>
      {items.map((item) => (
        <div key={item.id} className={styles.badgeItem}>
          <Badge onClick={() => onItemClick?.(item)}>{item.label}</Badge>
          <div className={styles.actions}>
            <button onClick={() => onActionClick?.('email', item)} title="Email">
              <i className="icon-email" />
            </button>
            <button onClick={() => onActionClick?.('chat', item)} title="Chat">
              <i className="icon-chat" />
            </button>
            <button onClick={() => onActionClick?.('calendar', item)} title="Calendar">
              <i className="icon-calendar" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
