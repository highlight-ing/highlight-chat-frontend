import React, {PropsWithChildren} from "react";

import styles from './circle-button.module.scss'

interface CircleButtonProps {
  fitContents?: boolean
  className?: string
  onClick: React.MouseEventHandler,
  size?: string
}

const CircleButton = ({children, className, fitContents, onClick, size}: PropsWithChildren<CircleButtonProps>) => {
  return (
    <button
      className={`${styles.circleButton} ${fitContents ? styles.fitContents : ''} ${className ?? ''}`}
      onClick={onClick}
      // @ts-ignore
      style={{'--size': size}}
    >
      {children}
    </button>
  )
}

export default CircleButton
