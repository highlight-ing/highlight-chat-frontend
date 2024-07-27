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

// const Primary = css`
//   background-color: ${({ theme }) => theme.brand.primary['90']};
//   color: ${({ theme }) => theme.text['100']};
//   border: none;
//
//   &:hover {
//     background-color: ${({ theme }) => theme.brand.primary['100']};
//   }
//
//   &:active {
//     background-color: ${({ theme }) => theme.brand.primary['80']};
//   }
// `

// const Tertiary = css`
//   background-color: ${({ theme }) => theme.button.tertiary['50']};
//   color: ${({ theme }) => theme.text['0']};
//   border: none;
//
//   &:hover {
//     background-color: ${({ theme }) => theme.button.tertiary['30']};
//   }
//
//   &:active {
//     background-color: ${({ theme }) => theme.button.tertiary['70']};
//   }
// `

// const Ghost = css`
//   background-color: transparent;
//   color: ${({ theme }) => theme.brand.primary['60']};
//
//   &:hover {
//     background-color: ${({ theme }) => theme.button.primary['10']};
//   }
//
//   &:active {
//     background-color: ${({ theme }) => theme.button.primary['40']};
//   }
// `

// const GhostNeutral = css`
//   background-color: transparent;
//   color: ${({ theme }) => theme.text['30']};
//
//   &:hover {
//     color: ${({ theme }) => theme.text['0']};
//     background-color: ${({ theme }) => theme.stroke['0A16']};
//   }
//
//   &:active {
//     color: ${({ theme }) => theme.text['0']};
//     background-color: ${({ theme }) => theme.neutral['0A8']};
//   }
// `

// const Danger = css`
//   border: 1px solid ${({ theme }) => theme.error['50']};
//   background-color: ${({ theme }) => theme.neutral['0A4']};
//   color: ${({ theme }) => theme.error['50']};
//
//   &:hover {
//     background-color: ${({ theme }) => theme.error['100']};
//     color: ${({ theme }) => theme.error['30']};
//   }
//
//   &:active {
//     background-color: ${({ theme }) => theme.error['70']};
//     color: ${({ theme }) => theme.error['10']};
//   }
// `

// const Success = css`
//   border: 1px solid ${({ theme }) => theme.success['50']};
//   background-color: ${({ theme }) => theme.neutral['0A4']};
//   color: ${({ theme }) => theme.success['50']};
//
//   &:hover {
//     background-color: ${({ theme }) => theme.success['100']};
//     color: ${({ theme }) => theme.success['30']};
//   }
//
//   &:active {
//     background-color: ${({ theme }) => theme.success['70']};
//     color: ${({ theme }) => theme.success['10']};
//   }
// `
