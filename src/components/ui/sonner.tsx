'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'toast group group-[.toaster]:rounded-xl group-[.toaster]:border-tertiary group-[.toaster]:bg-primary group-[.toaster]:bg-secondary group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-tertiary',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary',
          cancelButton: 'group-[.toast]:bg-hover group-[.toast]:text-primary',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
