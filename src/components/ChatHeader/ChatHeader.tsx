import {useStore} from "@/providers/store-provider";

import styles from './chatheader.module.scss'
import {MessageText} from "iconsax-react";
import {getPromptAppType} from "@/lib/promptapps";

const ChatHeader = ({isShowing}: {isShowing: boolean}) => {
  const {promptApp, promptName, promptDescription, promptUserId} = useStore((state) => ({
    promptApp: state.promptApp,
    promptName: state.promptName,
    promptDescription: state.promptDescription,
    promptUserId: state.promptUserId
  }))

  const promptType = getPromptAppType(promptUserId, promptApp)

  return (
    <div className={`${styles.chatHeader} ${isShowing ? styles.show : ''}`}>
      <div className={`${styles.promptIcon} ${styles[promptType]}`}>
        <MessageText variant={"Bold"} size={36}/>
      </div>
      <div className="flex flex-col items-center justify-center gap-0.5 max-w-screen-sm text-center">
        <span className={styles.promptName}>{promptName}</span>
        <span>{promptDescription}</span>
      </div>
    </div>
  )
}

export default ChatHeader
