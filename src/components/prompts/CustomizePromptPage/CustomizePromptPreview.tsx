import Image from 'next/image'
import { PromptTag } from '@/types'
import variables from '@/variables.module.scss'
import { Setting } from 'iconsax-react'

import { Prompt } from '@/types/supabase-helpers'
import { supabaseLoader } from '@/lib/supabase'
import usePromptApps from '@/hooks/usePromptApps'
import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import { useStore } from '@/components/providers/store-provider'
import Tooltip from '@/components/Tooltip/Tooltip'

import styles from './customize-prompt.module.scss'

export const CustomizePromptPreview = ({ prompt }: { prompt: Prompt }) => {
  const { selectPrompt } = usePromptApps()
  const closeModal = useStore((state) => state.closeModal)

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
          {/* @ts-ignore */}
          <PromptTags tags={prompt.tags as PromptTag[]} />
        </div>
        <div className={styles.customizePromptsItemFooterRightButtons}>
          <Tooltip position={'bottom'} tooltip={`Start a chat with ${prompt.name}`}>
            <Button
              className={styles.customizePromptButton}
              size="xsmall"
              variant="ghost-neutral"
              onClick={(e) => {
                e.stopPropagation()
                selectPrompt(prompt.external_id, true, false)
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

function PromptTags({ tags }: { tags: PromptTag[] }) {
  return (
    tags.length > 0 && (
      <div className={styles.promptTags}>
        {tags.map((tag) => (
          <Badge key={tag.value} variant="disabled">
            {tag.label}
          </Badge>
        ))}
      </div>
    )
  )
}
