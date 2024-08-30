import styles from './personal-prompts.module.scss'
import variables from '@/variables.module.scss'
import { useState } from 'react'
// Components
import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import { Setting, Trash, Lock, Edit2 } from 'iconsax-react'
import { Prompt } from '@/types/supabase-helpers'

const CSS_VARIABLES = {
  private: {
    icon: {
      color: variables.textPrimary,
    },
    background: {
      color: variables.backgroundSecondary,
      hoverColor: '#292929',
    },
    button: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.backgroundTertiary,
      borderColor: variables.tertiary50,
      hoverBorderColor: variables.tertiary50,
    },
    ctaButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.backgroundTertiary,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.tertiary50,
    },
    useButton: {
      textColor: variables.primary100,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.backgroundTertiary,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: '#00EAFF70',
    },
  },
  public: {
    icon: {
      color: variables.pink100,
    },
    background: {
      color: variables.backgroundSecondary,
      hoverColor: variables.pink20,
    },
    button: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.pink20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.pink40,
    },
    ctaButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.backgroundTertiary,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.backgroundTertiary,
    },
    useButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.pink20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.pink40,
    },
  },
  forked: {
    icon: {
      color: variables.primary100,
    },
    background: {
      color: variables.backgroundSecondary,
      hoverColor: variables.primary20,
    },
    button: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.primary20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.primary20,
    },
    ctaButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.backgroundTertiary,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.backgroundTertiary,
    },
    useButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.primary20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.primary20,
    },
  },
}

const PersonalPrompts = ({
  userId,
  prompts,
  openModal,
  selectPrompt,
}: {
  userId: string | undefined
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
                userId={userId}
                name={item.name}
                description={item.description ?? ''}
                slug={item.slug}
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
  userId,
  name,
  description,
  slug,
  selectPrompt,
  prompt,
  openModal,
  externalId,
  publicUseNumber,
}: {
  userId: string | undefined
  name: string
  description?: string
  slug: string
  selectPrompt: (prompt: Prompt) => void
  prompt: Prompt
  openModal: (modal: string, context?: Record<string, any>) => void
  externalId: string
  publicUseNumber: number
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isOwner = userId === prompt.user_id
  const isPublic = prompt.public
  const colorScheme = isOwner
    ? isPublic
      ? CSS_VARIABLES.public
      : CSS_VARIABLES.private
    : isPublic
      ? CSS_VARIABLES.forked
      : CSS_VARIABLES.private

  return (
    <div
      className={styles.personalPromptsItem}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? colorScheme.background.hoverColor : colorScheme.background.color,
      }}
    >
      <div className={styles.personalPromptsItemHeader}>
        <Setting color={colorScheme.icon.color} variant={'Bulk'} />
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
          {isPublic ? (
            <Button
              className={styles.filledButton}
              size="xsmall"
              variant="ghost-neutral"
              style={{
                border: `1px solid ${isHovered ? colorScheme.ctaButton.hoverBorderColor : colorScheme.ctaButton.borderColor}`,
                backgroundColor: isHovered
                  ? colorScheme.ctaButton.hoverBackgroundColor
                  : colorScheme.ctaButton.backgroundColor,
                color: colorScheme.ctaButton.textColor,
              }}
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
          ) : (
            <Button
              className={styles.filledButton}
              size="xsmall"
              variant="ghost-neutral"
              style={{
                border: `1px solid ${isHovered ? colorScheme.ctaButton.hoverBorderColor : colorScheme.ctaButton.borderColor}`,
                backgroundColor: isHovered
                  ? colorScheme.ctaButton.hoverBackgroundColor
                  : colorScheme.ctaButton.backgroundColor,
                color: colorScheme.ctaButton.textColor,
              }}
              onClick={() => openModal('change-prompt-visibility', { prompt })}
            >
              Publish
            </Button>
          )}
          <Badge variant="disabled" hidden={isHovered}>
            {publicUseNumber ? `${publicUseNumber} Uses` : 'No uses'}
          </Badge>
          <Button
            className={styles.filledButton}
            style={{
              border: `1px solid ${isHovered ? colorScheme.useButton.hoverBorderColor : colorScheme.useButton.borderColor}`,
              color: colorScheme.useButton.textColor,
            }}
            size="xsmall"
            variant="ghost-neutral"
            onClick={() => selectPrompt(prompt)}
            hidden={!isHovered}
          >
            Use
          </Button>
        </div>
        <div className={styles.personalPromptsItemFooterRightButtons}>
          <Button
            size="icon"
            variant="ghost-neutral"
            style={{
              border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
            }}
            onClick={() => openModal('confirm-delete-prompt', { externalId: externalId, name: name })}
            hidden={!isHovered}
          >
            <Trash color={variables.tertiary} variant={'Bold'} size="24" />
          </Button>
          {isPublic && (
            <Button
              size="icon"
              variant="ghost-neutral"
              style={{
                border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
              }}
              onClick={() => openModal('change-prompt-visibility', { prompt })}
              hidden={!isHovered}
            >
              <Lock color={variables.tertiary} variant={'Bold'} size="16" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost-neutral"
            style={{
              border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
            }}
            onClick={() => openModal('edit-prompt', { prompt })}
            hidden={!isHovered}
          >
            <Edit2 color={colorScheme.button.textColor} variant={'Bold'} size="16" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PersonalPrompts
