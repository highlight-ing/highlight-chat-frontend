import styles from '@/components/Messages/message.module.scss'

export function MessagesPlaceholder() {
  return (
    <div className={styles.messagesContainer}>
      <div className={styles.messages}>
        <div className={`${styles.messageContainer} ${styles.placeholder}`}>
          <div className={`${styles.message}`}></div>
        </div>

        <div className={`${styles.messageContainer} ${styles.placeholder}`}>
          <div className={`${styles.message}`}></div>
        </div>

        <div className={`${styles.messageContainer} ${styles.placeholder}`}>
          <div className={`${styles.message}`}></div>
        </div>
      </div>
    </div>
  )
}
