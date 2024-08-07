import {useStore} from "@/providers/store-provider";

import styles from './chatheader.module.scss'
import {MessageText} from "iconsax-react";

const ChatHeader = ({isShowing}: {isShowing: boolean}) => {
  const {promptName, promptDescription} = useStore((state) => ({
    promptName: state.promptName,
    promptDescription: state.promptDescription,
  }))

  return (
    <div className={`${styles.chatHeader} ${isShowing ? styles.show : ''}`}>
      <div className={styles.promptIcon}>
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
