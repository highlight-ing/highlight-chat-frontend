import * as React from "react";
import {TopBarProps} from "../../types/types";

import styles from './top-bar.module.scss'
import {AddCircle, Category} from "iconsax-react";
import CircleButton from "@/app/components/CircleButton/CircleButton";

const TopBar: React.FC<TopBarProps> = ({ onNewConversation }) => {
  return (
    <div className={styles.topBar}>
      <CircleButton onClick={() => {}}>
        <Category variant={"Bold"} size={24}/>
      </CircleButton>
      Highlight Chat
      <CircleButton onClick={onNewConversation}>
        <AddCircle variant={"Bold"} size={24}/>
      </CircleButton>
    </div>
  )
}

export default TopBar
