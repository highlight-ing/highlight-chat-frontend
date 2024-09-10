import { Prompt } from '@/types/supabase-helpers'
import styles from './customize-prompt.module.scss'
import variables from '@/variables.module.scss'
import { Setting } from 'iconsax-react'
import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'
import { supabaseLoader } from '@/lib/supabase'
import Image from 'next/image'
import usePromptApps from '@/hooks/usePromptApps'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'

export const CustomizePromptPreview = ({ prompt }: { prompt: Prompt }) => {
  const { selectPrompt } = usePromptApps()
  const { closeModal } = useStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )
  return (
    <div className={styles.customizePromptsItem}>
      <div className={styles.customizePromptsItemHeader}>
        {prompt.image ? (
          <Image
            src={`/user_content/${prompt.image}.${prompt.user_images?.file_extension}`}
            alt="Prompt image"
            className="h-6 w-6 rounded-full"
            width={24}
            height={24}
            loader={supabaseLoader}
          />
        ) : (
          <Setting color={variables.primary100} variant={'Bulk'} />
        )}
        <h3>{prompt.name}</h3>
      </div>
      <div className={styles.customizePromptsItemContent}>
        {prompt.description ? (
          <p>{prompt.description?.length > 90 ? `${prompt.description.substring(0, 90)}...` : prompt.description}</p>
        ) : (
          <p>No description</p>
        )}
      </div>
      <div className={styles.customizePromptsItemFooter}>
        <div className={styles.customizePromptsItemFooterLeftButtons}>
          <Badge variant="disabled">
            {prompt.public_use_number ? `${prompt.public_use_number} Users` : 'No users'}
          </Badge>
          {prompt.tags &&
            prompt.tags.length > 0 &&
            prompt.tags.map((tag, index) => (
              <Badge key={index - 1} variant="disabled">
                {tag.label}
              </Badge>
            ))}
        </div>
        <div className={styles.customizePromptsItemFooterRightButtons}>
          <Tooltip position={'bottom'} tooltip={`Start a chat with ${prompt.name}`}>
            <Button
              className={styles.filledButton}
              style={{
                border: `1px solid ${variables.primary100}`,
                color: variables.primary100,
              }}
              size="xsmall"
              variant="ghost-neutral"
              onClick={(e) => {
                e.stopPropagation()
                selectPrompt(prompt, true, false)
                closeModal('customize-prompt')
              }}
            >
              Chat
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
