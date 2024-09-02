import styles from './hotkey.module.scss'

const Hotkey = ({ hotkey, size, className }: { hotkey: string; size?: 'small'; className?: string }) => {
  return (
    <div className={styles.hotkeyContainer}>
      {hotkey.split(' + ').map((key) => {
        return (
          <div key={key} className={`${styles.hotkey} ${size ? styles[size] : ''} ${className ?? ''}`}>
            {key === 'Cmd' ? '⌘ ' : ''}
            {key.toLowerCase()}
          </div>
        )
      })}
    </div>
  )
}

export default Hotkey
