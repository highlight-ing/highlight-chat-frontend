import * as React from "react";
import { TopBarProps } from "../../types";

import styles from "./top-bar.module.scss";
import { AddCircle, Category } from "iconsax-react";
import CircleButton from "@/components/CircleButton/CircleButton";
import Tooltip from "@/components/Tooltip";
import { useStore } from "@/providers/store-provider";

const TopBar: React.FC<TopBarProps> = ({ showHistory, setShowHistory }) => {
  const { startNewConversation } = useStore((state) => ({
    startNewConversation: state.startNewConversation,
  }));

  return (
    <div className={styles.topBar}>
      {/* @TODO re-enable when history is working, set condition back to !showHistory */}
      <Tooltip
        tooltip="Show chats"
        position="right"
        wrapperStyle={showHistory ? { visibility: "hidden" } : undefined}
      >
        <CircleButton onClick={() => setShowHistory(!showHistory)}>
          <Category variant={"Bold"} size={24} />
        </CircleButton>
      </Tooltip>
      Highlight Chat
      <Tooltip tooltip="Start new chat" position="left">
        <CircleButton onClick={startNewConversation}>
          <AddCircle variant={"Bold"} size={24} />
        </CircleButton>
      </Tooltip>
    </div>
  );
};

export default TopBar;
