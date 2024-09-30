import styles from './Checkbox.module.scss'

interface CheckboxProps {
  checked?: boolean
  className?: string
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  readOnly?: boolean
}

const Checkbox = ({ className, checked, defaultChecked, disabled, onChange, readOnly }: CheckboxProps) => (
  <div className={`${styles.checkboxContainer} ${className}`}>
    <input
      type={'checkbox'}
      className={styles.hiddenCheckbox}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      readOnly={readOnly}
    />
    <div
      className={`${styles.styledCheckbox} ${checked ? styles.checked : ''} ${disabled ? styles.disabled : ''}`}
      onClick={() => {
        if (typeof onChange === 'function') {
          onChange({ target: { checked: !checked } } as React.ChangeEvent<HTMLInputElement>)
        }
      }}
    >
      <svg width="12" height="9" viewBox="0 0 12 9">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.12903 8.21331C5.39368 8.99555 4.16386 8.99555 3.4285 8.21331L0.710429 5.32193C0.283329 4.8676 0.299817 4.14773 0.747255 3.71405C1.19469 3.28037 1.90365 3.29711 2.33075 3.75144L4.77877 6.35554L9.67043 1.152C10.0975 0.697667 10.8065 0.680926 11.2539 1.11461C11.7014 1.54829 11.7178 2.26816 11.2907 2.72249L6.12903 8.21331Z"
        />
      </svg>
    </div>
  </div>
)

export default Checkbox
