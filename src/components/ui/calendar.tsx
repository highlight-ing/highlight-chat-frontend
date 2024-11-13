'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-[15px] font-normal text-primary',
        nav: 'flex items-center space-x-1',
        nav_button: 'size-7 grid place-items-center rounded-lg bg-tertiary p-0 opacity-50 hover:opacity-100',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'dark:text-neutral-400 w-8 rounded-md text-[0.8rem] font-normal text-secondary',
        row: 'mt-2 flex w-full',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-teal [&:has([aria-selected].day-outside)]:bg-tertiary [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: 'h-8 w-8 rounded-lg p-0 font-normal hover:bg-tertiary aria-selected:opacity-100',
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected: 'aria-selected:bg-teal aria-selected:text-black',
        day_today: 'bg-[#002F34] text-primary hover:bg-[#004B52]',
        day_outside:
          'day-outside text-secondary opacity-50 hover:bg-tertiary/70 aria-selected:bg-tertiary aria-selected:text-neutral-500',
        day_disabled: 'dark:text-neutral-400 text-neutral-500 opacity-50',
        day_range_middle:
          'dark:aria-selected:bg-neutral-800 dark:aria-selected:text-neutral-50 aria-selected:bg-neutral-100 aria-selected:text-neutral-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
