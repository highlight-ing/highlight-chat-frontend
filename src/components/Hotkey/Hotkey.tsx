import styles from './hotkey.module.scss'

const Hotkey = ({ hotkey, size }: { hotkey: string; size?: 'small' }) => {
  return (
    <div className={styles.hotkeyContainer}>
      {hotkey.split(' + ').map((key) => {
        return (
          <div key={key} className={`${styles.hotkey} ${size ? styles[size] : ''}`}>
            {key === 'Cmd' ? '⌘ ' : ''}
            {key.toLowerCase()}
          </div>
        )
      })}
    </div>
  )
}

export default Hotkey
