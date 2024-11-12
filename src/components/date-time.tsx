'use client'

import React, { useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  date?: Date
  setDate?: React.Dispatch<React.SetStateAction<Date | undefined>>
  label?: string
  className?: string
}

export function DatePicker(props: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date>()

  const date = props.date ?? internalDate
  const setDate = props.setDate ?? setInternalDate

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'group relative flex h-16 flex-col justify-start gap-2 rounded-[10px] border border-light-10 bg-secondary p-5 text-base font-[350] transition hover:border-light-20 data-[state=open]:border-light-40 data-[state=open]:bg-tertiary data-[state=open]:outline-none',
          props.className,
        )}
      >
        <p
          className={cn(
            'pointer-events-none absolute left-5 top-2 text-[13px] font-normal text-light-20 opacity-0 transition-opacity group-data-[state=open]:opacity-100',
            { 'opacity-100': date },
          )}
        >
          {props.label}
        </p>
        <span
          className={cn('transition focus:translate-y-2 group-data-[state=open]:translate-y-2', {
            'text-light-40': !date,
            'translate-y-2': date,
          })}
        >
          {date ? format(date, 'PPP') : 'Pick a date'}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-lg bg-secondary p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

interface TimeSelectProps {
  date: Date | undefined
  onChange?: (dateTime: Date) => void
  label?: string
  className?: string
}

export default function TimeSelect(props: TimeSelectProps) {
  const [time, setTime] = React.useState(() => {
    if (props.date) {
      const hours = props.date.getHours().toString().padStart(2, '0')
      const minutes = props.date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return '00:00'
  })

  const timeOptions = React.useMemo(() => {
    const times = []
    for (let i = 0; i < 48; i++) {
      const hours = Math.floor(i / 2)
        .toString()
        .padStart(2, '0')
      const minutes = i % 2 === 0 ? '00' : '30'
      times.push(`${hours}:${minutes}`)
    }
    return times
  }, [])

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)

    const [hours, minutes] = newTime.split(':')
    const newDateTime = props.date ? new Date(props.date) : new Date()
    newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

    props.onChange?.(newDateTime)
  }

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':')
    return new Date(2023, 0, 1, parseInt(hours, 10), parseInt(minutes, 10)).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isCustomTimeValue = !timeOptions.includes(time)

  return (
    <Select value={time} onValueChange={(value) => handleTimeChange(value)}>
      <SelectTrigger
        className={cn(
          'group relative flex h-16 w-36 flex-col justify-start gap-2 rounded-[10px] border border-light-10 bg-secondary p-5 text-base font-[350] transition hover:border-light-20 data-[state=open]:border-light-40 data-[state=open]:bg-tertiary data-[state=open]:outline-none',
          props.className,
        )}
      >
        <p
          className={cn(
            'pointer-events-none absolute left-5 top-2 text-[13px] font-normal text-light-20 opacity-0 transition-opacity group-data-[state=open]:opacity-100',
            { 'opacity-100': time },
          )}
        >
          {props.label}
        </p>
        <span
          className={cn('transition focus:translate-y-2 group-data-[state=open]:translate-y-2', {
            'text-light-40': !time,
            'translate-y-2': time,
          })}
        >
          {isCustomTimeValue ? time : time ? <SelectValue /> : <span>Select a time</span>}
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-64 w-36" sideOffset={4}>
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {formatTimeForDisplay(time)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type DateTimePickerProps = {
  defaultDateIso: string | undefined
  onChange: (dateTime: Date) => void
  dateFieldLabel?: string
  timeFieldLabel?: string
}

export function DateTimePicker(props: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    props.defaultDateIso ? new Date(props.defaultDateIso) : new Date(),
  )
  const [dateTime, setDateTime] = React.useState<Date>()

  useEffect(() => {
    if (!dateTime) return
    props.onChange(dateTime)
  }, [dateTime])

  return (
    <div className="grid grid-cols-3 gap-2">
      <DatePicker date={date} setDate={setDate} label={props.dateFieldLabel ?? 'Date'} className="col-span-2 w-full" />
      <TimeSelect
        date={date}
        onChange={setDateTime}
        label={props.timeFieldLabel ?? 'Starts'}
        className="col-span-1 w-full"
      />
    </div>
  )
}
