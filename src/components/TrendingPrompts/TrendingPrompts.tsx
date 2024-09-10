import styles from './trending-prompts.module.scss'
import variables from '@/variables.module.scss'
import { Prompt } from '@/types/supabase-helpers'
import { Setting, ArchiveSlash, ArchiveAdd } from 'iconsax-react'
import { useState, useEffect, useMemo } from 'react'
import { PromptTag, PinnedPrompt } from '@/types'
import { supabaseLoader } from '@/lib/supabase'
import Image from 'next/image'

// Components
import Button from '@/components/Button/Button'
import { Badge } from '@/components/Badge/Badge'
import Tooltip from '@/components/Tooltip/Tooltip'

const TrendingPrompts = ({
  userId,
  prompts,
  pinnedPrompts,
  openModal,
  selectPrompt,
}: {
  userId: string | undefined
  prompts: Prompt[]
  pinnedPrompts: PinnedPrompt[]
  openModal: (modal: string, context?: Record<string, any>) => void
  selectPrompt: (prompt: Prompt) => void
}) => {
  const mergedPrompts = useMemo(() => {
    const pinnedPromptIds = new Set(pinnedPrompts.map((p) => p?.external_id))
    return prompts.map((prompt) => ({
      ...prompt,
      isPinned: pinnedPromptIds.has(prompt.external_id),
    }))
  }, [prompts, pinnedPrompts])

  return (
    <div className={styles.trendingPromptsContainer}>
      {prompts.length > 0 && (
        <div className={styles.trendingPromptsHeader}>
          <h2>Top 10 Trending Prompts</h2>
          <div className={styles.trendingPrompts}>
            {mergedPrompts.map((item, index) => (
              <TrendingPromptsItem
                key={item.name}
                name={item.name}
                description={item.description ?? ''}
                slug={item.slug}
                color={variables.primary100}
                selectPrompt={selectPrompt}
                prompt={item}
                tags={item.tags as PromptTag[] | null}
                lastItem={index === mergedPrompts.length - 1}
                openModal={openModal}
                publicUseNumber={item.public_use_number}
                userId={userId}
                pinState={item.isPinned}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const TrendingPromptsItem = ({
  name,
  description,
  slug,
  color,
  selectPrompt,
  prompt,
  tags,
  lastItem,
  openModal,
  publicUseNumber,
  userId,
  pinState,
}: {
  name: string
  description?: string
  slug: string
  color?: string
  selectPrompt: (prompt: Prompt, startNewConversation?: boolean, pinPrompt?: boolean) => void
  prompt: Prompt
  tags?: PromptTag[] | null
  lastItem: boolean
  openModal: (modal: string, context?: Record<string, any>) => void
  publicUseNumber: number
  userId: string | undefined
  pinState: boolean
}) => {
  const [isPinned, setIsPinned] = useState(pinState)

  useEffect(() => {
    setIsPinned(pinState)
  }, [pinState])

  return (
    <div className={`${styles.trendingPromptsItem} ${lastItem ? styles.lastItem : ''}`}>
      <div className={styles.trendingPromptsItemHeader}>
        <div className={styles.trendingPromptsItemHeaderLeft}>
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
            <Setting color={color} variant={'Bulk'} />
          )}
          <h3>{name}</h3>
        </div>
        <div className={styles.trendingPromptsItemHeaderRight}>
          <Tooltip
            position={'bottom'}
            tooltip={
              <div className={'flex flex-col gap-1'}>
                Pin to Assistant{'\n'}
                <span className={'text-xs text-light-60'}>Show this prompt when you summon Highlight</span>
              </div>
            }
          >
            <Button
              size="icon"
              variant="tertiary"
              className={styles.filledButton}
              onClick={() => {
                openModal('pin-prompt', { prompt })
              }}
              disabled={isPinned}
            >
              {isPinned ? (
                <ArchiveSlash color={variables.textPrimary} variant={'Bold'} size="16" />
              ) : (
                <ArchiveAdd color={variables.textPrimary} variant={'Bold'} size="16" />
              )}
            </Button>
          </Tooltip>
          <Tooltip
            position={'bottom'}
            tooltip={
              <div className={'flex flex-col gap-1'}>
                Preview Prompt {'\n'}
                <span className={'text-xs text-light-60'}>Preview this prompt to find out how it works</span>
              </div>
            }
          >
            <Button
              size="xsmall"
              variant="tertiary"
              className={styles.filledButton}
              onClick={() => {
                openModal('preview-prompt', { prompt })
              }}
            >
              Preview
            </Button>
          </Tooltip>
          <Tooltip position={'bottom'} tooltip={`Start a chat with ${prompt.name}`}>
            <Button
              className={styles.filledButton}
              size="xsmall"
              variant="primary"
              onClick={() => selectPrompt(prompt, true, false)}
            >
              Chat
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className={styles.trendingPromptsItemContent}>
        {description ? (
          <p>{description?.length > 200 ? `${description.substring(0, 200)}...` : description}</p>
        ) : (
          <p>No description</p>
        )}
      </div>
      <div className={styles.trendingPromptsItemFooter}>
        <div className={styles.tagsContainer}>
          <Badge variant="disabled">{publicUseNumber ? `${publicUseNumber} Uses` : 'No uses'}</Badge>
          {tags &&
            tags.length > 0 &&
            tags.map((tag, index) => (
              <Badge key={index - 1} variant="disabled">
                {tag.label}
              </Badge>
            ))}
        </div>
      </div>
    </div>
  )
}

export default TrendingPrompts
