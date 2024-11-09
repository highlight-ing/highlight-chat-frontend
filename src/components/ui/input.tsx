import { cn } from '@/lib/utils'
import React from 'react'

interface InputProps extends React.ComponentProps<'input'> {
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, children, label, type, ...rest } = props

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-5 top-2 text-[13px] font-normal text-light-20 opacity-0 transition-opacity focus:opacity-100">
        {label}
      </span>
      <input
        type={type}
        className={cn(
          'relative flex h-16 w-36 flex-col justify-start gap-2 rounded-[10px] border border-light-10 bg-secondary p-5 text-base font-[350] transition hover:border-light-20 data-[state=open]:border-light-40 data-[state=open]:bg-tertiary data-[state=open]:outline-none',
          className,
        )}
        ref={ref}
        {...rest}
      />
    </div>
  )
})

Input.displayName = 'Input'
