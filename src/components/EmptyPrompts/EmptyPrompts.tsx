import styles from './empty-prompts.module.scss'
import variables from '@/variables.module.scss'
import { Setting } from 'iconsax-react'
import Button from '@/components/Button/Button'
import { useStore } from '@/providers/store-provider'

export default function EmptyPrompts() {
  const openModal = useStore((state) => state.openModal)

  return (
    <div className={styles.emptyPersonalPrompts}>
      <Setting color={variables.light20} variant="Bold" />
      <p>Shortcuts you create and favorite will be added here.</p>
      <Button size="small" variant="tertiary" onClick={() => openModal('create-prompt')}>
        Create Shortcut
      </Button>
    </div>
  )
}
