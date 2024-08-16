import styles from './closebutton.module.scss'

interface CloseButtonProps {
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  position?: string
  size?: string | number
}

const CloseButton = ({ size = '22', position, className, onClick = () => {} }: CloseButtonProps) => {
  return (
    <button
      className={`${styles.closeButton} ${className ?? ''}`}
      onClick={onClick}
      // @ts-ignore
      style={{ '--size': size, '--position': position }}
    >
      <svg width={`${size}`} height={`${size}`} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          className={styles.circle}
          d="M10.9998 21.8332C16.9582 21.8332 21.8332 16.9582 21.8332 10.9998C21.8332 5.0415 16.9582 0.166504 10.9998 0.166504C5.0415 0.166504 0.166504 5.0415 0.166504 10.9998C0.166504 16.9582 5.0415 21.8332 10.9998 21.8332Z"
        />
        <path
          className={styles.x}
          d="M7.93408 14.0657L14.0657 7.93408"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className={styles.x}
          d="M14.0657 14.0657L7.93408 7.93408"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default CloseButton
