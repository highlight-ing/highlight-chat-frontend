import { ReactElement, PropsWithChildren } from 'react'
import styles from './settingoption.module.scss'

const SettingOption = ({
  children,
  label,
  description,
}: PropsWithChildren<{ label: string | ReactElement; description: string | ReactElement }>) => {
  return (
    <div className={styles.settingOption}>
      <div className={'flex flex-col gap-1'}>
        <h1 className={'text-light-100'}>{label}</h1>
        <span className={'text-light-60'}>{description}</span>
      </div>
      {children}
    </div>
  )
}

export default SettingOption
