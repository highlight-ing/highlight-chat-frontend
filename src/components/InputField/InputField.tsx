import React from "react";
import styles from './inputfield.module.scss'

interface InputFieldProps {
  label?: string;
  placeholder?: string
  size: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
  value?: string
  onChange?: (e: React.ChangeEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

const InputField: React.FC<InputFieldProps> = ({label, placeholder, value, size, onChange, onKeyDown, ...props}) => {
  const renderInput = () => {
    return (
      <input
        {...props}
        className={`${styles.inputField} ${styles[size]}`}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    )
  }

  if (label) {
    return (
      <div className={'flex flex-col gap-3'}>
        <span className={styles.inputLabel}>{label}</span>
        {renderInput()}
      </div>
    )
  }

  return renderInput()
}

export default InputField
