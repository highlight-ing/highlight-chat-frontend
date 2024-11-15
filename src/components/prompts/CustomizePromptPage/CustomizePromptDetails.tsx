import { Prompt } from '@/types/supabase-helpers'
import { CustomizePromptPreview } from '@/components/prompts/CustomizePromptPage/CustomizePromptPreview'
import IntelliPrompt from '@/components/prompts/PromptEditor/IntelliPrompt'

import styles from './customize-prompt.module.scss'

export function CustomizePromptDetails({ prompt }: { readonly prompt: Prompt }) {
  return (
    <>
      <CustomizePromptPreview prompt={prompt} />
      <div className={styles.appPromptAccordion}>
        <IntelliPrompt value={prompt.prompt_text ?? ''} hideVariables hideTemplates readOnly />
      </div>
    </>
  )
}
