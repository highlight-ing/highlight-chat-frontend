import styles from './personal-prompts.module.scss'
import variables from '@/variables.module.scss'
import { useState } from 'react'
import { PersonalPromptsProps, PersonalPromptsItemProps } from '@/types'

// Components
import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import { Setting, Trash, Lock, Edit2, ElementPlus } from 'iconsax-react'
import EmptyPrompts from '@/components/EmptyPrompts/EmptyPrompts'
import { Prompt } from '@/types/supabase-helpers'
import Image from 'next/image'
import { supabaseLoader } from '@/lib/supabase'

// Custom Variables for styling
import CSS_VARIABLES from './customVariables'

type PromptWithPin = Prompt & { isPinned?: boolean }

const PersonalPrompts = ({ userId, prompts, pinnedPrompts, openModal, selectPrompt }: PersonalPromptsProps) => {
  if (prompts.length === 0 && pinnedPrompts.length === 0) {
    return <EmptyPrompts openModal={openModal} />
  }

  // Magic code here don't touch :)
  const mergedPrompts = [
    ...prompts,
    ...pinnedPrompts.map((pinnedPrompt) => ({ ...pinnedPrompt.prompts, isPinned: true }) as PromptWithPin),
  ].reduce((acc: PromptWithPin[], current: PromptWithPin) => {
    const x = acc.find((item) => item.external_id === current.external_id)
    if (!x) {
      return acc.concat([current])
    } else {
      return acc.map((item) =>
        item.external_id === current.external_id ? { ...item, isPinned: item.isPinned || current.isPinned } : item,
      )
    }
  }, [])

  return (
    <div className={styles.personalPromptsContainer}>
      <div className={styles.personalPromptsHeader}>
        <div className={styles.personalPromptsHeaderLeft}>
          <h2>Pinned Prompts</h2>
        </div>
        <div className={styles.personalPromptsHeaderRight}>
          <Button size="xsmall" variant="ghost-neutral" onClick={() => openModal('create-prompt')}>
            <ElementPlus color={variables.tertiary} variant={'Bold'} size="16" />
            New Prompt
          </Button>
        </div>
      </div>
      <div className={styles.personalPrompts}>
        {mergedPrompts.map((item: Prompt) => {
          const isOwner = userId === item.user_id
          const isPublic = item.public
          const isPinned = pinnedPrompts.some((pinnedPrompt) => pinnedPrompt.prompts?.external_id === item.external_id)
          const colorScheme = isOwner
            ? isPublic
              ? CSS_VARIABLES.public
              : CSS_VARIABLES.private
            : isPublic && isPinned
              ? CSS_VARIABLES.private
              : CSS_VARIABLES.pinned

          return (
            <PersonalPromptsItem
              prompt={item}
              key={item.external_id}
              selectPrompt={selectPrompt}
              openModal={openModal}
              isOwner={isOwner}
              isPublic={isPublic}
              colorScheme={colorScheme}
            />
          )
        })}
      </div>
    </div>
  )
}

const PersonalPromptsItem = ({
  prompt,
  selectPrompt,
  openModal,
  colorScheme,
  isOwner,
  isPublic,
}: PersonalPromptsItemProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
          <Setting color={colorScheme.icon.color} variant={'Bulk'} />
        )}
        <h3>{prompt.name}</h3>
      </div>
      <div className={styles.personalPromptsItemContent}>
        {prompt.description ? (
          <p>{prompt.description?.length > 90 ? `${prompt.description.substring(0, 90)}...` : prompt.description}</p>
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
                const url = `https://chat.highlight.ing/prompts/${prompt.slug}`
                navigator.clipboard.writeText(url)
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
              }}
              disabled={isCopied}
            >
              {isCopied ? 'Copied' : 'Share'}
            </Button>
          ) : isOwner ? (
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
          ) : null}
          <Badge variant="disabled" hidden={isHovered}>
            {prompt.public_use_number ? `${prompt.public_use_number} Uses` : 'No uses'}
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
            Chat
          </Button>
        </div>
        <div className={styles.personalPromptsItemFooterRightButtons}>
          {isOwner ? (
            <>
              <Button
                size="icon"
                variant="ghost-neutral"
                style={{
                  border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
                }}
                onClick={() =>
                  openModal('confirm-delete-prompt', { externalId: prompt.external_id, name: prompt.name })
                }
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
            </>
          ) : (
            <Button
              size="icon"
              variant="ghost-neutral"
              style={{
                border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
              }}
              onClick={() => openModal('unpin-prompt', { prompt })}
              hidden={!isHovered}
            >
              <Trash color={colorScheme.button.textColor} variant={'Bold'} size="16" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonalPrompts
