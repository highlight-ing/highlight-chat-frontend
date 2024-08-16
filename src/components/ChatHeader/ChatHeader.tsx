import { useStore } from '@/providers/store-provider'

import styles from './chatheader.module.scss'
import { MessageText } from 'iconsax-react'
import { getPromptAppType } from '@/lib/promptapps'
import { useShallow } from 'zustand/react/shallow'
import PromptAppIcon from '../PromptAppIcon/PromptAppIcon'

const ChatHeader = ({ isShowing }: { isShowing: boolean }) => {
  const { promptApp, promptName, promptDescription, promptUserId } = useStore(
    useShallow((state) => ({
      promptApp: state.promptApp,
      promptName: state.promptName,
      promptDescription: state.promptDescription,
      promptUserId: state.promptUserId,
    })),
  )

  const promptType = getPromptAppType(promptUserId, promptApp)

  return (
    <div className={`${styles.chatHeader} ${isShowing ? styles.show : ''}`}>
      <div className={`${styles.promptIcon} ${styles[promptType]}`}>
        {promptApp && promptApp.image && promptApp.user_images?.file_extension ? (
          <PromptAppIcon
            className={styles.promptIcon}
            imageId={promptApp!.image!}
            imageExtension={promptApp!.user_images?.file_extension ?? ''}
          />
        ) : (
          <MessageText variant={'Bold'} size={36} />
        )}
      </div>
      <div className="flex max-w-screen-sm flex-col items-center justify-center gap-0.5 text-center">
        <span className={styles.promptName}>{promptName}</span>
        <span>{promptDescription}</span>
      </div>
    </div>
  )
}

export default ChatHeader
