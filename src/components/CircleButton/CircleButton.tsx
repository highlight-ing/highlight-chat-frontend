import React, {PropsWithChildren} from "react";

import styles from './circle-button.module.scss'

interface CircleButtonProps {
  fitContents?: boolean
  className?: string
  onClick: React.MouseEventHandler
}

const CircleButton = ({children, className, fitContents, onClick}: PropsWithChildren<CircleButtonProps>) => {
  return (
    <button className={`${styles.circleButton} ${fitContents ? styles.fitContents : ''} ${className ?? ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

export default CircleButton
