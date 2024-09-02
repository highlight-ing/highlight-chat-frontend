import { usePromptEditorStore } from '@/stores/prompt-editor'
import { Crown, Note, Screenmirroring, Shapes, VoiceSquare } from 'iconsax-react'
import sassVariables from '@/variables.module.scss'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'

export const TemplatesTool = () => {
  const { setPromptEditorData } = usePromptEditorStore()

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
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a code reviewer. You will review code and provide suggestions for improvements. Use the screen data {{screen}} to help the user with their code.',
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
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a meeting summarizer. You will summarize the meeting notes from either the {{audio}} or {{clipboard_text}} that is provided. If both of these are missing, prompt the user to attach them.',
          name: 'Meeting Summarizer',
          description: 'A meeting summarizer that will summarize meeting notes.',
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
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a blog post generator. You will generate a blog post based on the screen data {{screen}} that is provided.',
          name: 'Blog Post Generator',
          description:
            'A blog post generator that will generate a blog post based on the screen data that is provided.',
        })
      },
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <Crown variant="Bold" size={20} color={sassVariables.textSecondary} />
          Lizard Person
        </div>
      ),
      onClick: () => {
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a lizzard person. Joke about how you will take over the world using the screen data {{screen}}, audio {{audio}}, and clipboard text {{clipboard_text}} that is provided.',
          name: 'Lizzard Person',
          description: 'A lizzard person who will take over the world.',
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
                    New to prompts? Check out some templates to get started.
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
