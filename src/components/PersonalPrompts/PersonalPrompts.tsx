import styles from './personal-prompts.module.scss'
import variables from '@/variables.module.scss'
import { useState } from 'react'
import { PersonalPromptsProps, PersonalPromptsItemProps } from '@/types'

// Components
import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import { Setting, Trash, Lock, Edit2, ElementPlus, ArchiveMinus } from 'iconsax-react'
import EmptyPrompts from '@/components/EmptyPrompts/EmptyPrompts'
import { Prompt } from '@/types/supabase-helpers'
import Image from 'next/image'
import { supabaseLoader } from '@/lib/supabase'

// Custom Variables for styling
import CSS_VARIABLES from './customVariables'
import Tooltip from '@/components/Tooltip/Tooltip'
import usePromptApps from '@/hooks/usePromptApps'
import { useStore } from '@/providers/store-provider'

type PromptWithPin = Prompt & { isPinned?: boolean }

const PersonalPrompts = ({ userId, prompts, pinnedPrompts }: PersonalPromptsProps) => {
  const openModal = useStore((state) => state.openModal)

  if (prompts.length === 0 && pinnedPrompts.length === 0) {
    return <EmptyPrompts openModal={openModal} />
  }

  // Merge and deduplicate prompts and pinnedPrompts
  const mergedPrompts = [
    ...prompts,
    // Add isPinned property to all pinned prompts
    ...pinnedPrompts.map((pinnedPrompt) => ({ ...pinnedPrompt, isPinned: true }) as PromptWithPin),
  ].reduce((acc: PromptWithPin[], current: PromptWithPin) => {
    // Check if the current prompt already exists in the accumulator
    const x = acc.find((item) => item.external_id === current.external_id)
    if (!x) {
      // If not found, add the current prompt to the accumulator
      return acc.concat([current])
    } else {
      // If found, update the existing prompt
      return acc.map((item) =>
        item.external_id === current.external_id
          ? // Merge isPinned status, keeping true if either is true
            { ...item, isPinned: item.isPinned || current.isPinned }
          : item,
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
          <Button size="medium" variant="ghost-neutral" onClick={() => openModal('create-prompt')}>
            <ElementPlus color={variables.tertiary} variant={'Bold'} size="16" />
            New Prompt
          </Button>
        </div>
      </div>
      <div className={styles.personalPrompts}>
        {mergedPrompts.map((item: Prompt) => {
          const isOwner = userId === item.user_id
          const isPublic = item.public
          const isPinned = pinnedPrompts.some((pinnedPrompt) => pinnedPrompt?.external_id === item.external_id)
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

const PersonalPromptsItem = ({ prompt, colorScheme, isOwner, isPublic }: PersonalPromptsItemProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { selectPrompt } = usePromptApps()
  const openModal = useStore((state) => state.openModal)

  return (
    <div
      className={styles.personalPromptsItem}
      onClick={() => selectPrompt(prompt.external_id, true, false)}
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
            <Tooltip position={'bottom'} tooltip={isCopied ? undefined : 'Copy share link'}>
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
                onClick={(e) => {
                  e.stopPropagation()
                  const url = `https://chat.highlight.ing/prompts/${prompt.slug}`
                  navigator.clipboard.writeText(url)
                  setIsCopied(true)
                  setTimeout(() => setIsCopied(false), 2000)
                }}
                disabled={isCopied}
              >
                {isCopied ? 'Copied' : 'Share'}
              </Button>
            </Tooltip>
          ) : isOwner ? (
            <Tooltip
              position={'bottom'}
              tooltip={
                <div className={'flex flex-col gap-1'}>
                  Publish your prompt
                  <span className={'text-xs text-light-60'}>Make your prompt public for it to trend</span>
                </div>
              }
            >
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
                onClick={(e) => {
                  e.stopPropagation()
                  openModal('change-prompt-visibility', { prompt })
                }}
              >
                Publish
              </Button>
            </Tooltip>
          ) : null}
          <Badge variant="disabled" hidden={isHovered}>
            {prompt.public_use_number ? `${prompt.public_use_number} Uses` : 'No uses'}
          </Badge>
          <Tooltip position={'bottom'} tooltip={`Start a chat with ${prompt.name}`}>
            <Button
              className={styles.filledButton}
              style={{
                border: `1px solid ${isHovered ? colorScheme.useButton.hoverBorderColor : colorScheme.useButton.borderColor}`,
                color: colorScheme.useButton.textColor,
              }}
              size="xsmall"
              variant="ghost-neutral"
              onClick={(e) => {
                e.stopPropagation()
                selectPrompt(prompt.external_id, true, false)
              }}
              hidden={!isHovered}
            >
              Chat
            </Button>
          </Tooltip>
        </div>
        <div className={styles.personalPromptsItemFooterRightButtons}>
          {isOwner ? (
            <>
              <Tooltip position={'bottom'} tooltip={<span className={'text-rose-400'}>Delete prompt</span>}>
                <Button
                  size="icon"
                  variant="ghost-neutral"
                  style={{
                    border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal('confirm-delete-prompt', { externalId: prompt.external_id, name: prompt.name })
                  }}
                  hidden={!isHovered}
                >
                  <Trash color={variables.tertiary} variant={'Bold'} size="24" />
                </Button>
              </Tooltip>
              {isPublic && (
                <Tooltip position={'bottom'} tooltip={'Change prompt visibility'}>
                  <Button
                    size="icon"
                    variant="ghost-neutral"
                    style={{
                      border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      openModal('change-prompt-visibility', { prompt })
                    }}
                    hidden={!isHovered}
                  >
                    <Lock color={variables.tertiary} variant={'Bold'} size="16" />
                  </Button>
                </Tooltip>
              )}
              <Tooltip position={'bottom'} tooltip={'Edit prompt'}>
                <Button
                  size="icon"
                  variant="ghost-neutral"
                  style={{
                    border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal('edit-prompt', { prompt })
                  }}
                  hidden={!isHovered}
                >
                  <Edit2 color={colorScheme.button.textColor} variant={'Bold'} size="16" />
                </Button>
              </Tooltip>
            </>
          ) : (
            <Tooltip position={'bottom'} tooltip={'Unpin prompt'}>
              <Button
                size="icon"
                variant="ghost-neutral"
                style={{
                  border: `1px solid ${isHovered ? colorScheme.button.hoverBorderColor : colorScheme.button.borderColor}`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  openModal('unpin-prompt', { prompt })
                }}
                hidden={!isHovered}
              >
                <ArchiveMinus color={colorScheme.button.textColor} variant={'Bold'} size="16" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonalPrompts
