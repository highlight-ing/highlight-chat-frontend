import { forwardRef, PropsWithChildren } from 'react'
import styles from './button.module.scss'

type SizeType = 'large' | 'medium' | 'small' | 'xsmall'
export type ButtonVariantType = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'ghost-neutral' | 'danger' | 'success'

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  size: SizeType
  variant: ButtonVariantType
}

const Button = forwardRef(
  (
    { disabled, size, variant, children, ...rest }: PropsWithChildren<ButtonProps>,
    ref: React.Ref<HTMLButtonElement>,
  ) => {
    return (
      <button ref={ref} className={`${styles.button} ${styles[size]} ${styles[variant]} ${disabled ? styles.disabled : ''} `} {...rest}>
        {children}
      </button>
    )
  },
)

export default Button
