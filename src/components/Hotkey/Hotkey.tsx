import styles from './hotkey.module.scss'

const Hotkey = ({hotkey}: {hotkey: string}) => {
  return (
    <div className={styles.hotkeyContainer}>
      {
        hotkey.split(' + ').map(key => {
          return (
            <div key={key} className={styles.hotkey}>{key === 'Cmd' ? '⌘ ' : ''}{key.toLowerCase()}</div>
          )
        })
      }
    </div>
  )
}

export default Hotkey
