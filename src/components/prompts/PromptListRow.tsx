import React from 'react'
import { ArrowRight, Edit2, MessageText } from 'iconsax-react'

import { Prompt } from '@/types/supabase-helpers'
import styles from '@/components/ChatHome/chathome.module.scss'
import CircleButton from '@/components/CircleButton/CircleButton'
import Tooltip from '@/components/Tooltip/Tooltip'

import PromptAppIcon from '../PromptAppIcon/PromptAppIcon'

interface PromptListRowProps {
  prompt: Prompt
  icon?: React.ReactElement
  type: 'self' | 'community' | 'official' | 'default'
  onClick: (e: React.MouseEvent) => void
  onClickEdit?: (e: React.MouseEvent) => void
  isCta?: boolean
}

const PromptListRow = ({ prompt, icon, type, isCta, onClick, onClickEdit }: PromptListRowProps) => {
  const handleClick = (e: React.MouseEvent) => {
    onClick(e)
  }

  return (
    <div key={prompt.slug} className={`${styles.promptOption} ${styles[type]}`} onClick={handleClick}>
      <div>
        {prompt.image ? (
          <PromptAppIcon
            width={48}
            height={48}
            imageId={prompt.image}
            imageExtension={prompt.user_images?.file_extension ?? ''}
          />
        ) : (
          <div className={styles.promptIcon}>
            <MessageText variant={'Bold'} />
          </div>
        )}
      </div>
      <div className="mt-0.5 flex flex-1 flex-col">
        {prompt.name && <span className={styles.promptName}>{prompt.name}</span>}
        {prompt.description && (
          <span className={`${styles.promptDescription} ${isCta ? styles.isCta : ''}`}>{prompt.description}</span>
        )}
      </div>
      <div className={`${styles.promptArrow} ${isCta || typeof onClickEdit === 'function' ? styles.show : ''}`}>
        {typeof onClickEdit === 'function' && (
          <Tooltip tooltip={'Edit Prompt'} position={'left'}>
            <CircleButton
              onClick={(e) => {
                e.stopPropagation()
                onClickEdit(e)
              }}
            >
              <Edit2 variant={'Bold'} />
            </CircleButton>
          </Tooltip>
        )}
        {typeof onClickEdit === 'undefined' && (
          <>
            {isCta && <span>Start Chat</span>}
            <ArrowRight size={20} />
          </>
        )}
      </div>
    </div>
  )
}

export default PromptListRow
