import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styles from './inputfield.module.scss'

interface InputFieldProps {
  label?: string
  placeholder?: string
  size: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
  value?: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  error?: string
}

const InputField: React.FC<InputFieldProps> = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, placeholder, value, size, onBlur, onChange, onFocus, onKeyDown, error, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [showLabel, setShowLabel] = useState(!!value?.length)

    useImperativeHandle(ref, () => inputRef.current!, [])

    const onFocusEvent = (e: React.FocusEvent<HTMLInputElement>) => {
      if (typeof onFocus === 'function') {
        onFocus(e)
      }
      setShowLabel(true)
    }

    const onBlurEvent = (e: React.FocusEvent<HTMLInputElement>) => {
      if (typeof onBlur === 'function') {
        onBlur(e)
      }
      setShowLabel(!!e.target.value.length)
    }

    const renderInput = () => {
      return (
        <input
          ref={inputRef}
          {...props}
          className={`${styles.inputField} ${styles[size]} ${size === 'xxlarge' && showLabel ? styles.label : ''}`}
          value={value}
          placeholder={placeholder}
          onBlur={onBlurEvent}
          onChange={onChange}
          onFocus={onFocusEvent}
          onKeyDown={onKeyDown}
        />
      )
    }

    useEffect(() => {
      const inputValue = inputRef.current?.value
      if (inputValue?.length && !showLabel) {
        setShowLabel(true)
      } else if (!inputValue?.length && showLabel) {
        setShowLabel(false)
      }
    }, [])

    return (
      <div className={'relative flex flex-col gap-2'}>
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

export default InputField
