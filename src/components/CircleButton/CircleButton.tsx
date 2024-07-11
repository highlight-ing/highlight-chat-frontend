import React, {PropsWithChildren} from "react";

import styles from './circle-button.module.scss'

interface CircleButtonProps {
  onClick: React.MouseEventHandler
}

const CircleButton = ({children, onClick}: PropsWithChildren<CircleButtonProps>) => {
  return (
    <button className={styles.circleButton} onClick={onClick}>
      {children}
    </button>
  )
}

export default CircleButton
