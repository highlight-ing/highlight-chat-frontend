import React, { forwardRef, useState } from 'react'

import styles from './inputfield.module.scss'

interface TextAreaProps {
  label?: string
  placeholder?: string
  size: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
  value?: string
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  rows?: number
  error?: string
}

const TextArea: React.FC<TextAreaProps> = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, placeholder, value, size, onBlur, onChange, onFocus, onKeyDown, error, ...props }, ref) => {
    const [showLabel, setShowLabel] = useState(false)

    const onFocusEvent = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (typeof onFocus === 'function') {
        onFocus(e)
      }
      setShowLabel(true)
    }

    const onBlurEvent = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (typeof onBlur === 'function') {
        onBlur(e)
      }
      setShowLabel(!!e.target.value.length)
    }

    const renderInput = () => {
      return (
        <textarea
          {...props}
          className={`${styles.textArea} ${styles[size]} ${size === 'xxlarge' && showLabel ? styles.label : ''}`}
          value={value}
          placeholder={placeholder}
          onBlur={onBlurEvent}
          onChange={onChange}
          onFocus={onFocusEvent}
          onKeyDown={onKeyDown}
          ref={ref}
        />
      )
    }

    return (
      <div className={'relative flex flex-col gap-3'}>
        <span
          className={`${styles.inputLabel} ${size === 'xxlarge' ? styles.inline : ''} ${size === 'xxlarge' && showLabel ? styles.visible : ''}`}
        >
          {label}
        </span>
        {renderInput()}
        {error && <span className={styles.inputError}>{error}</span>}
      </div>
    )
  },
)
TextArea.displayName = 'TextArea'

export default TextArea
