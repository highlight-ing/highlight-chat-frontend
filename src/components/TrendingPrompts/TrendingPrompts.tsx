import styles from './trending-prompts.module.scss'
import variables from '@/variables.module.scss'
import { Prompt } from '@/types/supabase-helpers'
import { Setting } from 'iconsax-react'
import { useState } from 'react'
// Components
import Button from '@/components/Button/Button'
import { Badge } from '@/components/Badge/Badge'

const TrendingPrompts = ({
  prompts,
  openModal,
  selectPrompt,
}: {
  prompts: Prompt[]
  openModal: (modal: string) => void
  selectPrompt: (prompt: Prompt) => void
}) => {
  return (
    <div className={styles.trendingPromptsContainer}>
      {prompts.length > 0 ? (
        <div className={styles.trendingPromptsHeader}>
          <h2>Trending Prompts</h2>
          <div className={styles.trendingPrompts}>
            {prompts.map((item, index) => (
              <TrendingPromptsItem
                key={item.name}
                name={item.name}
                description={item.description ?? ''}
                slug={item.slug}
                color={variables.primary100}
                selectPrompt={selectPrompt}
                prompt={item}
                tags={item.tags}
                lastItem={index === prompts.length - 1}
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
}: {
  name: string
  description?: string
  slug: string
  color?: string
  selectPrompt: (prompt: Prompt) => void
  prompt: Prompt
  tags?: string[]
  lastItem: boolean
}) => {
  const [isCopied, setIsCopied] = useState(false)
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
            onClick={() => {
              const url = `https://chat.highlight.ing/prompts/${slug}`
              navigator.clipboard.writeText(url)
              setIsCopied(true)
              setTimeout(() => setIsCopied(false), 2000)
            }}
          >
            {isCopied ? 'Copied' : 'Share'}
          </Button>
          <Button size="xsmall" variant="primary" onClick={() => selectPrompt(prompt)}>
            Use
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
        <Badge variant="outline">21,240 Uses</Badge>
        {tags && tags.length > 0 && (
          <div className={styles.trendingPromptsItemFooterTags}>
            {tags.map((tag) => (
              <Badge variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrendingPrompts
