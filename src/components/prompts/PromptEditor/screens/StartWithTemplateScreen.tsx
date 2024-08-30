import styles from '../prompteditor.module.scss'
import TemplateSelectorBox from '../TemplateSelectorBox'

export default function StartWithTemplateScreen() {
  return (
    <div className="flex max-h-full min-h-0 flex-col items-center">
      <div className={styles.templatesPage}>
        <h4 className="font-medium text-white">Start with a template</h4>
        <TemplateSelectorBox />
      </div>
    </div>
  )
}
