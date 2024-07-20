import * as React from "react";
import { TopBarProps } from "../../types";

import styles from "./top-bar.module.scss";
import { AddCircle, Category } from "iconsax-react";
import CircleButton from "@/components/CircleButton/CircleButton";
import Tooltip from "@/components/Tooltip";
import { useStore } from "@/providers/store-provider";
import { useRouter } from "next/navigation";

const TopBar: React.FC<TopBarProps> = ({ showHistory, setShowHistory }) => {
  const router = useRouter();

  const { startNewConversation, promptName } = useStore((state) => ({
    startNewConversation: state.startNewConversation,
    promptName: state.promptName,
  }));

  const onNewChatClick = () => {
    startNewConversation();

    router.push("/");
  };

  return (
    <div className={styles.topBar}>
      {/* @TODO re-enable when history is working, set condition back to !showHistory */}
      <Tooltip
        tooltip="Show chats"
        position="right"
        wrapperStyle={true ? { visibility: "hidden" } : undefined}
      >
        <CircleButton onClick={() => setShowHistory(!showHistory)}>
          <Category variant={"Bold"} size={24} />
        </CircleButton>
      </Tooltip>
      {promptName ? promptName : "Highlight Chat"}
      <Tooltip tooltip="Start new chat" position="left">
        <CircleButton onClick={onNewChatClick}>
          <AddCircle variant={"Bold"} size={24} />
        </CircleButton>
      </Tooltip>
    </div>
  );
};

export default TopBar;
