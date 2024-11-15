'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import type { SelectTrigger as SelectTriggerPrimitive } from '@radix-ui/react-select'
import type { PopoverTrigger as PopoverTriggerPrimitive } from '@radix-ui/react-popover'
import { Slot } from '@radix-ui/react-slot'
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { SelectTrigger } from './select'
import { Textarea } from './textarea'
import { Input } from './input'
import { PopoverTrigger } from './popover'
import { ChevronDownIcon } from '@radix-ui/react-icons'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState, getValues } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)
  const fieldValue = getValues(fieldContext.name)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    value: fieldValue,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div
          ref={ref}
          className={cn(
            'group relative isolate w-full [&>[data-slot=input]]:h-10 [&>[data-slot=label]+[data-slot=input]]:h-14 [&>[data-slot=label]+[data-slot=popover]]:h-14 [&>[data-slot=label]+[data-slot=select]]:h-14 [&>[data-slot=message]]:pt-1.5 [&>[data-slot=popover]]:h-10 [&>[data-slot=select]]:h-10',
            className,
          )}
          {...props}
        />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { formItemId, value } = useFormField()

  return (
    <Label
      ref={ref}
      data-slot="label"
      className={cn(value && 'opacity-100', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    )
  },
)
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn('text-[0.8rem] text-neutral-500 dark:text-neutral-400', className)}
        {...props}
      />
    )
  },
)
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        data-slot="message"
        id={formMessageId}
        className={cn('pl-3 text-[0.8rem] font-medium text-red/80', className)}
        {...props}
      >
        {body}
      </p>
    )
  },
)
FormMessage.displayName = 'FormMessage'

const FormSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTriggerPrimitive>,
  React.ComponentPropsWithoutRef<typeof SelectTriggerPrimitive>
>(({ className, children, ...props }, ref) => {
  const { error } = useFormField()

  return (
    <SelectTrigger
      ref={ref}
      data-slot="select"
      className={cn(error && 'border-red/70 hover:border-red data-[state=open]:border-red', className)}
      {...props}
    >
      {children}
    </SelectTrigger>
  )
})
FormSelectTrigger.displayName = SelectTrigger.displayName

const FormPopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverTriggerPrimitive>,
  React.ComponentPropsWithoutRef<typeof PopoverTriggerPrimitive>
>(({ className, children, ...props }, ref) => {
  const { error } = useFormField()

  return (
    <PopoverTrigger
      ref={ref}
      className={cn(
        'relative flex w-full gap-2 rounded-2xl border border-light-10 bg-secondary px-3 py-2 text-[15px] text-primary outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 disabled:cursor-not-allowed disabled:opacity-50 group-has-[label]:pb-2 group-has-[label]:pt-7 group-has-[label]:leading-snug data-[state=open]:border-light-20 data-[state=open]:bg-tertiary [&>span]:line-clamp-1',
        error && 'border-red/70 hover:border-red data-[state=open]:border-red',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
    </PopoverTrigger>
  )
})
FormPopoverTrigger.displayName = PopoverTrigger.displayName

const FormTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, rows = 4, ...props }, ref) => {
    const { error } = useFormField()

    return (
      <Textarea
        className={cn(error && 'border-red/70 hover:border-red focus:border-red', className)}
        ref={ref}
        {...props}
      />
    )
  },
)
FormTextarea.displayName = 'Textarea'

const FormInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    const { error } = useFormField()

    return (
      <Input
        type={type}
        className={cn(error && 'border-red/70 hover:border-red focus:border-red', className)}
        ref={ref}
        {...props}
      />
    )
  },
)
FormInput.displayName = 'Input'

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormSelectTrigger,
  FormTextarea,
  FormInput,
  FormPopoverTrigger,
}
