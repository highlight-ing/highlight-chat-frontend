import styles from './personal-prompts.module.scss'
import variables from '@/variables.module.scss'
import { useState } from 'react'
// Components
import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import { Setting, Trash, Lock, Edit2 } from 'iconsax-react'
import { Prompt } from '@/types/supabase-helpers'

const PersonalPrompts = ({
  prompts,
  openModal,
  selectPrompt,
}: {
  prompts: Prompt[]
  openModal: (modal: string, context?: Record<string, any>) => void
  selectPrompt: (prompt: Prompt) => void
}) => {
  return (
    <div className={styles.personalPromptsContainer}>
      {prompts.length > 0 ? (
        <div className={styles.personalPromptsHeader}>
          <h2>My Prompts</h2>
          <div className={styles.personalPrompts}>
            {prompts.map((item) => (
              <PersonalPromptsItem
                key={item.name}
                name={item.name}
                description={item.description ?? ''}
                slug={item.slug}
                color={variables.primary100}
                selectPrompt={selectPrompt}
                prompt={item}
                openModal={openModal}
                externalId={item.external_id}
                publicUseNumber={item.public_use_number}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyPersonalPrompts}>
          <Setting color={variables.light20} variant={'Bold'} />
          <p>Prompts you create and favorite will be added here.</p>
          <Button size="small" variant="tertiary" onClick={() => openModal('create-prompt')}>
            Create Prompt
          </Button>
        </div>
      )}
    </div>
  )
}

const PersonalPromptsItem = ({
  name,
  description,
  slug,
  color,
  selectPrompt,
  prompt,
  openModal,
  externalId,
  publicUseNumber,
}: {
  name: string
  description?: string
  slug: string
  color?: string
  selectPrompt: (prompt: Prompt) => void
  prompt: Prompt
  openModal: (modal: string, context?: Record<string, any>) => void
  externalId: string
  publicUseNumber: number
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div
      className={styles.personalPromptsItem}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.personalPromptsItemHeader}>
        <Setting color={color} variant={'Bulk'} />
        <h3>{name}</h3>
      </div>
      <div className={styles.personalPromptsItemContent}>
        {description ? (
          <p>{description?.length > 90 ? `${description.substring(0, 90)}...` : description}</p>
        ) : (
          <p>No description</p>
        )}
      </div>
      <div className={styles.personalPromptsItemFooter}>
        <div className={styles.personalPromptsItemFooterLeftButtons}>
          <Button
            size="xsmall"
            variant="primary"
            onClick={() => {
              const url = `https://chat.highlight.ing/prompts/${slug}`
              navigator.clipboard.writeText(url)
              setIsCopied(true)
              setTimeout(() => setIsCopied(false), 2000)
            }}
            disabled={isCopied}
          >
            {isCopied ? 'Copied' : 'Share'}
          </Button>
          <Badge variant="outline" hidden={isHovered}>
            {publicUseNumber ? `${publicUseNumber} Uses` : 'No uses'}
          </Badge>
          <Button size="xsmall" variant="ghost-neutral" onClick={() => selectPrompt(prompt)} hidden={!isHovered}>
            Use
          </Button>
        </div>
        <div className={styles.personalPromptsItemFooterRightButtons}>
          <Button
            size="xsmall"
            variant="ghost-neutral"
            onClick={() => openModal('confirm-delete-prompt', { externalId: externalId, name: name })}
          >
            <Trash color={variables.tertiary} variant={'Bold'} size="16" />
          </Button>
          <Button
            size="xsmall"
            variant="ghost-neutral"
            onClick={() => openModal('change-prompt-visibility', { prompt })}
          >
            <Lock color={variables.tertiary} variant={'Bold'} size="16" />
          </Button>
          <Button size="xsmall" variant="ghost-neutral" onClick={() => openModal('edit-prompt', { prompt })}>
            <Edit2 color={variables.tertiary} variant={'Bold'} size="16" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PersonalPrompts
