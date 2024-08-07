import {useStore} from "@/providers/store-provider";

import styles from './chatheader.module.scss'
import {MessageText} from "iconsax-react";
import {PromptApp} from "@/types";

const getPromptType = (selfUserId?: string, prompt?: PromptApp) => {
  if (selfUserId && prompt && selfUserId === prompt?.user_id) {
    return 'self'
  }
  if (prompt?.slug === 'hlchat') {
    return 'official'
  }
  return 'community'
}

const ChatHeader = ({isShowing}: {isShowing: boolean}) => {
  const {promptApp, promptName, promptDescription, promptUserId} = useStore((state) => ({
    promptApp: state.promptApp,
    promptName: state.promptName,
    promptDescription: state.promptDescription,
    promptUserId: state.promptUserId
  }))

  const promptType = getPromptType(promptUserId, promptApp)

  return (
    <div className={`${styles.chatHeader} ${isShowing ? styles.show : ''}`}>
      <div className={`${styles.promptIcon} ${styles[promptType]}`}>
        <MessageText variant={"Bold"} size={36}/>
      </div>
      <div className="flex flex-col items-center justify-center gap-0.5">
        <span className={styles.promptName}>{promptName}</span>
        <span>{promptDescription}</span>
      </div>
    </div>
  )
}

export default ChatHeader
