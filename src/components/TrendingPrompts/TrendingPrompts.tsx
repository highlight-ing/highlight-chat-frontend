import styles from './trending-prompts.module.scss'
import variables from '@/variables.module.scss'
import { Prompt } from '@/types/supabase-helpers'
import { Setting, ArchiveSlash, ArchiveAdd, Messages2 } from 'iconsax-react'
import { useState, useEffect, useMemo } from 'react'
import { PromptTag, PinnedPrompt } from '@/types'
import { supabaseLoader } from '@/lib/supabase'
import Image from 'next/image'

// Components
import Button from '@/components/Button/Button'
import { Badge } from '@/components/Badge/Badge'
import Tooltip from '@/components/Tooltip/Tooltip'
import usePromptApps from '@/hooks/usePromptApps'
import { useStore } from '@/providers/store-provider'
import { PreferredAttachment } from '../prompts/PreferredAttachment/PreferredAttachment'
import { usePinPromptAction } from '@/presentations/modals/PinPromptModal'

const TrendingPrompts = ({
  userId,
  prompts,
  pinnedPrompts,
}: {
  userId: string | undefined
  prompts: Prompt[]
  pinnedPrompts: PinnedPrompt[]
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
          <h2>Top 10 Trending Actions</h2>
          <div className={styles.trendingPrompts}>
            {mergedPrompts.map((item, index) => {
              return (
                <TrendingPromptsItem
                  key={item.name}
                  name={item.name}
                  description={item.description ?? ''}
                  slug={item.slug}
                  color={variables.primary100}
                  prompt={item}
                  // @ts-ignore
                  tags={item.tags as PromptTag[] | null}
                  lastItem={index === mergedPrompts.length - 1}
                  publicUseNumber={item.public_use_number}
                  userId={userId}
                  pinState={item.isPinned}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const TrendingPromptsItem = ({
  name,
  description,
  color,
  prompt,
  tags,
  lastItem,
  publicUseNumber,
  pinState,
}: {
  name: string
  description?: string
  slug: string
  color?: string
  prompt: Prompt
  tags?: PromptTag[] | null
  lastItem: boolean
  publicUseNumber: number
  userId: string | undefined
  pinState: boolean
}) => {
  const openModal = useStore((state) => state.openModal)
  const { selectPrompt } = usePromptApps()
  const { pinPrompt } = usePinPromptAction()
  const [isPinned, setIsPinned] = useState(pinState)

  useEffect(() => {
    setIsPinned(pinState)
  }, [pinState])

  return (
    <div
      className={`${styles.trendingPromptsItem} ${lastItem ? styles.lastItem : ''}`}
      onClick={() => {
        openModal('customize-prompt', { prompt })
      }}
    >
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
          <Tooltip position={'bottom'} tooltip={`Start a chat with ${prompt.name}`}>
            <Button
              className={styles.filledButton}
              size="icon"
              variant="tertiary"
              onClick={(e) => {
                e.stopPropagation()
                selectPrompt(prompt.external_id, true, false)
              }}
            >
              <Messages2 color={variables.textPrimary} variant={'Bold'} size="16" />
            </Button>
          </Tooltip>
          <Tooltip
            position={'bottom'}
            tooltip={
              <div className={'flex flex-col gap-1'}>
                Preview Action {'\n'}
                <span className={'text-xs text-light-60'}>Preview this action to find out how it works</span>
              </div>
            }
          >
            <Button
              size="xsmall"
              variant="tertiary"
              className={styles.filledButton}
              onClick={(e) => {
                e.stopPropagation()
                openModal('customize-prompt', { prompt })
              }}
            >
              Preview
            </Button>
          </Tooltip>
          <Tooltip
            position={'bottom'}
            tooltip={
              <div className={'flex flex-col gap-1'}>
                Pin to Assistant{'\n'}
                <span className={'text-xs text-light-60'}>Show this action when you summon Highlight</span>
              </div>
            }
          >
            <Button
              size="xsmall"
              variant="primary"
              className={styles.filledButton}
              onClick={(e) => {
                e.stopPropagation()
                openModal('pin-prompt', { prompt }, () => {
                  pinPrompt(prompt)
                })
              }}
              disabled={isPinned}
            >
              {isPinned ? 'Pinned' : 'Pin'}
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
      {prompt.preferred_attachment && <PreferredAttachment type={prompt.preferred_attachment} />}
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
