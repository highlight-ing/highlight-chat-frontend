import sassVariables from '@/variables.module.scss'
import { Note, Screenmirroring, Shapes, VoiceSquare } from 'iconsax-react'

import Button from '@/components/Button/Button'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import { useStore } from '@/components/providers/store-provider'
import Tooltip from '@/components/Tooltip/Tooltip'

export const TemplatesTool = ({ hidden }: { hidden: boolean }) => {
  const openModal = useStore((state) => state.openModal)

  const APP_PROMPT_COMMENT =
    "{{! These are comments, they won't effect the output of your app }}\n{{! The app prompt determines how your app will behave to the user. }}\n"

  const contextMenuItems = [
    {
      label: (
        <div className="flex items-center gap-2">
          <Screenmirroring variant="Bold" size={20} color={sassVariables.textSecondary} />
          Code Reviewer
        </div>
      ),
      onClick: () => {
        openModal('confirm-override-prompt', {
          data: {
            appPrompt:
              APP_PROMPT_COMMENT +
              'You are a code reviewer. You will review code and provide suggestions for improvements. Use the screen data to help the user with their code.',
            name: 'Code Reviewer',
            description: 'A code reviewer that will review code and provide suggestions for improvements.',
          },
        })
      },
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <Note variant="Bold" size={20} color={sassVariables.textSecondary} />
          Meeting Summarizer
        </div>
      ),
      onClick: () => {
        openModal('confirm-override-prompt', {
          data: {
            appPrompt:
              APP_PROMPT_COMMENT +
              'You are a meeting summarizer. You will summarize the meeting notes from either the audio or clipboard text that is provided. If both of these are missing, prompt the user to attach them.',
            name: 'Meeting Summarizer',
            description: 'A meeting summarizer that will summarize meeting notes.',
          },
        })
      },
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <VoiceSquare variant="Bold" size={20} color={sassVariables.textSecondary} />
          Blog Post Generator
        </div>
      ),
      onClick: () => {
        openModal('confirm-override-prompt', {
          data: {
            appPrompt:
              APP_PROMPT_COMMENT +
              'You are a blog post generator. You will generate a blog post based on the screen data that is provided.',
            name: 'Blog Post Generator',
            description:
              'A blog post generator that will generate a blog post based on the screen data that is provided.',
          },
        })
      },
    },
  ]

  return (
    <ContextMenu
      key="templates-menu"
      items={contextMenuItems}
      position={'bottom'}
      triggerId={`toggle-templates`}
      leftClick={true}
      hidden={hidden}
    >
      {
        // @ts-ignore
        ({ isOpen }) => (
          <Tooltip
            position={'bottom'}
            tooltip={
              isOpen ? undefined : (
                <div className={'flex flex-col gap-1'}>
                  <span>Explore template examples</span>
                  <span className={'text-xs text-light-60'}>
                    New to shortcuts? Check out some templates to get started.
                  </span>
                </div>
              )
            }
          >
            <Button id="toggle-templates" size={'medium'} variant={'ghost-neutral'}>
              <Shapes variant="Bold" size={16} color={sassVariables.backgroundAccent} />
              Templates
            </Button>
          </Tooltip>
        )
      }
    </ContextMenu>
  )
}
