import Modal from '@/components/modals/Modal'
import { type ModalObjectProps } from '@/types'
import React, { useEffect, useState } from 'react'
import { Prompt } from '@/types/supabase-helpers'
import styles from './modals.module.scss'
import Highlight from '@highlight-ai/app-runtime'
import Hotkey from '@/components/Hotkey/Hotkey'
import { ArchiveAdd, MessageText } from 'iconsax-react'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'

const PromptAddedModal = ({ id, context }: ModalObjectProps) => {
  const prompt = context?.prompt as Prompt
  const [hotkey, setHotkey] = useState<string>('alt + .')

  useEffect(() => {
    const fetchHotkey = async () => {
      const hotkey = await Highlight.app.getHotkey()
      setHotkey(hotkey)
    }
    fetchHotkey()
  }, [])

  return (
    <Modal id={id} size={'small'} bodyClassName={styles.promptIntroModal}>
      <div className={'flex flex-col gap-3 p-4'}>
        <div className={'flex flex-col gap-1'}>
          <span className={styles.chattingWith}>Now available in Highlight:</span>
          <div className={'flex items-center gap-3'}>
            {prompt.image ? (
              <PromptAppIcon
                width={22}
                height={22}
                imageId={prompt.image}
                imageExtension={prompt.user_images?.file_extension ?? ''}
              />
            ) : (
              <div className={styles.promptIcon}>
                <MessageText variant={'Bold'} />
              </div>
            )}
            <h1>{prompt.name}</h1>
          </div>
        </div>
        <p>{prompt.description}</p>
      </div>
      <div className={styles.footer}>
        <ArchiveAdd size={22} variant={'Bold'} />
        <span>
          You can use <strong>{prompt.name}</strong> when you summon Highlight. Try it with{' '}
          <Hotkey hotkey={hotkey} size={'small'} className={styles.hotkey} />
        </span>
      </div>
    </Modal>
  )
}

export default PromptAddedModal
