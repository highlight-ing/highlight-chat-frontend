import * as React from "react";
import {TopBarProps} from "../../types/types";

import styles from './top-bar.module.scss'
import {AddCircle, Category} from "iconsax-react";
import CircleButton from "@/app/components/CircleButton/CircleButton";
import Tooltip from "@/app/components/Tooltip";

const TopBar: React.FC<TopBarProps> = ({ onNewConversation, showHistory, setShowHistory }) => {
  return (
    <div className={styles.topBar}>
      {/* @TODO re-enable when history is working, set condition back to !showHistory */}
      <Tooltip tooltip="Show chats" position="right" wrapperStyle={true ? {visibility: "hidden"} : undefined}>
        <CircleButton onClick={() => setShowHistory(!showHistory)}>
          <Category variant={"Bold"} size={24}/>
        </CircleButton>
      </Tooltip>
      Highlight Chat
      <Tooltip tooltip="Start new chat" position="left">
        <CircleButton onClick={onNewConversation}>
          <AddCircle variant={"Bold"} size={24}/>
        </CircleButton>
      </Tooltip>
    </div>
  )
}

export default TopBar
