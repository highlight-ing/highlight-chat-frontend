import { useStore } from '@/providers/store-provider'

import styles from './chatheader.module.scss'
import { Link, MessageText, ArrowLeft } from 'iconsax-react'
import { getPromptAppType } from '@/lib/promptapps'
import { useShallow } from 'zustand/react/shallow'
import PromptAppIcon from '../PromptAppIcon/PromptAppIcon'
import Button from '../Button/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ChatHeader = ({ isShowing }: { isShowing: boolean }) => {
  // const { myPrompts } = usePromptApps()
  const router = useRouter()

  const { startNewConversation, promptApp, promptName, promptDescription, promptUserId, clearPrompt } = useStore(
    useShallow((state) => ({
      startNewConversation: state.startNewConversation,
      promptApp: state.promptApp,
      promptName: state.promptName,
      promptDescription: state.promptDescription,
      promptUserId: state.promptUserId,
      clearPrompt: state.clearPrompt,
    })),
  )

  const isMyPrompt = false

  const [isCopied, setIsCopied] = useState(false)

  const slug = promptApp?.slug ?? ''
  const openModal = useStore((state) => state.openModal)

  function onCopyClick() {
    navigator.clipboard.writeText(`https://chat.highlight.ing/prompts/${slug}`)

    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 1000)
  }

  function onEditClick() {
    openModal('edit-prompt', { prompt: isMyPrompt })
  }

  function onGoHomeClick() {
    startNewConversation()
    clearPrompt()
    router.push('/')
  }

  const promptType = getPromptAppType(promptUserId, promptApp)

  return (
    <div className={`${styles.chatHeader} ${isShowing ? styles.show : ''}`}>
      {/* Add Back to home arrow to this screen */}
      <div className={styles.backToHome}>
        <Button onClick={onGoHomeClick} size={'small'} variant={'ghost'}>
          <ArrowLeft size={24} /> Go Home
        </Button>
      </div>
      <div className={`${styles.promptIcon} ${styles[promptType]}`}>
        {promptApp && promptApp.image && promptApp.user_images?.file_extension ? (
          <PromptAppIcon
            width={90}
            height={90}
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
      <div className="flex flex-row gap-2">
        <Button disabled={isCopied} onClick={onCopyClick} size={'small'} variant={'ghost'}>
          <Link size={14} />
          {isCopied ? 'Copied!' : 'Copy Share Link'}
        </Button>
        {isMyPrompt && (
          <Button onClick={onEditClick} size={'small'} variant={'ghost'}>
            Edit
          </Button>
        )}
      </div>
    </div>
  )
}

export default ChatHeader
