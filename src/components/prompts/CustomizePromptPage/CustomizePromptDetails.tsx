import { Prompt } from '@/types/supabase-helpers'
import styles from './customize-prompt.module.scss'
import IntelliPrompt from '@/components/prompts/PromptEditor/IntelliPrompt'
import { CustomizePromptPreview } from '@/components/prompts/CustomizePromptPage/CustomizePromptPreview'

export function CustomizePromptDetails({ prompt }: { prompt: Prompt }) {
  return (
    <>
      <CustomizePromptPreview prompt={prompt} />
      <div className={styles.appPromptAccordion}>
        <IntelliPrompt value={prompt.prompt_text ?? ''} hideVariables hideTemplates readOnly />
      </div>
    </>
  )
}
