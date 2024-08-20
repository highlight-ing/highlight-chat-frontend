import styles from './message.module.scss'

const MessagesPlaceholder = () => {
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

export default MessagesPlaceholder
