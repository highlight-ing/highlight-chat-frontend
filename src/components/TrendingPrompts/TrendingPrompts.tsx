import styles from './trending-prompts.module.scss'
import variables from '@/variables.module.scss'
import { Prompt } from '@/types/supabase-helpers'
import { Setting } from 'iconsax-react'
import { useState, useEffect } from 'react'
import { PromptTag } from '@/types'
import { useMemo } from 'react'
import { addPromptToUser } from '@/utils/prompts'
// Components
import Button from '@/components/Button/Button'
import { Badge } from '@/components/Badge/Badge'

const TrendingPrompts = ({
  userId,
  prompts,
  pinnedPrompts,
  openModal,
  selectPrompt,
}: {
  userId: string | undefined
  prompts: Prompt[]
  pinnedPrompts: Prompt[]
  openModal: (modal: string, context?: Record<string, any>) => void
  selectPrompt: (prompt: Prompt) => void
}) => {
  const mergedPrompts = useMemo(() => {
    // @ts-expect-error
    const pinnedPromptIds = new Set(pinnedPrompts.map((p) => p.prompts.external_id))
    return prompts.map((prompt) => ({
      ...prompt,
      isPinned: pinnedPromptIds.has(prompt.external_id),
    }))
  }, [prompts, pinnedPrompts])

  console.log(mergedPrompts)
  return (
    <div className={styles.trendingPromptsContainer}>
      {prompts.length > 0 ? (
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
      ) : (
        <div className={styles.emptyTrendingPrompts}>
          <Setting color={variables.light20} variant={'Bold'} />
          <p>Prompts you create or fork will be added here.</p>
          <Button size="small" variant="tertiary" onClick={() => openModal('create-prompt')}>
            Create Prompt
          </Button>
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
  selectPrompt: (prompt: Prompt) => void
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
          <Setting color={color} variant={'Bulk'} />
          <h3>{name}</h3>
        </div>
        <div className={styles.trendingPromptsItemHeaderRight}>
          <Button
            size="xsmall"
            variant="tertiary"
            className={styles.filledButton}
            onClick={() => {
              openModal('pin-prompt', { prompt })
            }}
            disabled={isPinned}
          >
            {isPinned ? 'Pinned' : 'Pin'}
          </Button>
          <Button className={styles.filledButton} size="xsmall" variant="primary" onClick={() => selectPrompt(prompt)}>
            Chat
          </Button>
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
        <Badge variant="disabled">{publicUseNumber ? `${publicUseNumber} Uses` : 'No uses'}</Badge>
        {tags &&
          tags.length > 0 &&
          tags.map((tag, index) => (
            <Badge key={index} variant="disabled">
              {tag.label}
            </Badge>
          ))}
      </div>
    </div>
  )
}

export default TrendingPrompts
