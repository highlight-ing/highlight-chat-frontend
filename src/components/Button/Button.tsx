import React, { forwardRef, PropsWithChildren } from 'react'
import styles from './button.module.scss'

type SizeType = 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall' | 'icon'
export type ButtonVariantType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'ghost-neutral'
  | 'danger'
  | 'success'
  | 'primary-outline'

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  size: SizeType
  variant: ButtonVariantType
  hidden?: boolean
}

const Button = forwardRef(
  (
    { disabled, size, variant, children, className, hidden, ...rest }: PropsWithChildren<ButtonProps>,
    ref: React.Ref<HTMLButtonElement>,
  ) => {
    return (
      <button
        ref={ref}
        className={`${styles.button} ${styles[size]} ${styles[variant]} ${
          disabled ? styles.disabled : ''
        } ${className ?? ''} ${hidden ? styles.hidden : ''}`}
        {...rest}
      >
        {children}
      </button>
    )
  },
)

export default Button
