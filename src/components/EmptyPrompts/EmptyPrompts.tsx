import styles from './empty-prompts.module.scss'
import variables from '@/variables.module.scss'
import { Setting } from 'iconsax-react'
import Button from '@/components/Button/Button'
import { PersonalPromptsProps } from '@/types'

const EmptyPrompts = ({ openModal }: Pick<PersonalPromptsProps, 'openModal'>) => (
  <div className={styles.emptyPersonalPrompts}>
    <Setting color={variables.light20} variant="Bold" />
    <p>Prompts you create and favorite will be added here.</p>
    <Button size="small" variant="tertiary" onClick={() => openModal('create-prompt')}>
      Create Prompt
    </Button>
  </div>
)

export default EmptyPrompts
