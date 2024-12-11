import React, { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps'
import { format } from 'date-fns'
import { Add } from 'iconsax-react'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormPopoverTrigger,
  FormSelectTrigger,
  FormTextarea,
} from '@/components/ui/form'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { GoogleIcon, GoogleMeetIcon, XIcon } from '@/components/icons'

import { CreateGoogleCalendarEventParams } from '../_hooks/use-integrations'
import { IntegrationsLoader } from '../_components/loader'
import { SetupConnection } from '../_components/setup-connection'
import { IntegrationSubmitButton } from '../_components/submit-button'
import { IntegrationSuccessMessage } from '../_components/success-message'
import { checkGoogleConnectionStatus, createMagicLinkForGoogle } from './actions'
import { useCheckGoogleCalConnection, useCreateGoogleCalEvent } from './hooks'
import { extractDateAndTime } from './utils'

const GOOGLE_MAPS_API_KEY = 'AIzaSyDQDl9RiOxREU45HQHr_GoU0KL8EBVLi38'

const googleCalEventFormSchema = z
  .object({
    summary: z.string().min(1),
    location: z.string().optional(),
    description: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    includeGoogleMeetDetails: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.start && data.end) {
        return new Date(data.start) < new Date(data.end)
      }
      return true
    },
    {
      message: 'Start date must be before end date',
      path: ['end'],
    },
  )

export type GoogleCalEventFormSchema = z.infer<typeof googleCalEventFormSchema>

type GoogleCalEventDropdownProps = {
  field: ControllerRenderProps<GoogleCalEventFormSchema>
}

function DatePickerDropdown(props: GoogleCalEventDropdownProps) {
  if (typeof props.field.value === 'boolean') {
    return
  }

  const { date: dateValue, time: timeValue } = extractDateAndTime(props.field.value)

  function handleChange(date: Date | undefined, time: string) {
    if (!date) return

    const [hours, minutes] = time.split(':').map(Number)
    const combinedDateTime = new Date(date)
    combinedDateTime.setHours(hours, minutes)

    props.field.onChange(combinedDateTime.toISOString())
  }

  const formattedDate = dateValue ? format(dateValue, 'PPPP') : 'Pick a date'

  return (
    <Popover>
      <FormPopoverTrigger>{formattedDate}</FormPopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-lg bg-secondary p-0">
        <Calendar mode="single" selected={dateValue} onSelect={(date) => handleChange(date, timeValue)} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

function TimeSelectDropdown(props: GoogleCalEventDropdownProps) {
  const { date: dateValue, time: timeValue } = extractDateAndTime(props.field.value)

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

  function handleChange(date: Date | undefined, time: string) {
    if (!date) return

    const [hours, minutes] = time.split(':').map(Number)
    const combinedDateTime = new Date(date)
    combinedDateTime.setHours(hours, minutes)

    props.field.onChange(combinedDateTime.toISOString())
  }

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':')
    return new Date(2023, 0, 1, parseInt(hours, 10), parseInt(minutes, 10)).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isCustomTimeValue = !timeOptions.includes(timeValue)

  return (
    <Select value={timeValue} onValueChange={(time) => handleChange(dateValue, time)}>
      <FormSelectTrigger value={timeValue} className="">
        {isCustomTimeValue ? timeValue : timeValue ? <SelectValue /> : <span>Select a time</span>}
      </FormSelectTrigger>
      <SelectContent className="w-36" sideOffset={4}>
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {formatTimeForDisplay(time)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function InviteeDropdown() {
  return (
    <Select>
      <FormSelectTrigger>
        <SelectValue placeholder="Select an invitee" />
      </FormSelectTrigger>
      <SelectContent className="max-h-[270px]" sideOffset={4}>
        <SelectItem key="james" value="james">
          James Swingos
        </SelectItem>
        <SelectItem key="pim" value="pim">
          Pim de Witte
        </SelectItem>
        <SelectItem key="pim" value="pim">
          Jeroen van der Heijden
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

type GoogleCalEventFormProps = {
  data: CreateGoogleCalendarEventParams
  onSuccess?: (url: string) => void
}

interface PlaceAutocompleteProps {
  value: string
  onChange: (place: string) => void
}

const PlaceAutocomplete = ({ value, onChange }: PlaceAutocompleteProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const places = useMapsLibrary('places')

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value
    }
  }, [value])

  useEffect(() => {
    if (!places || !inputRef.current) return

    const options = {
      fields: [],
    }

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options))
  }, [places])

  useEffect(() => {
    if (!inputRef.current) return

    const handleInputChange = () => {
      onChange(inputRef.current?.value ?? '')
    }

    inputRef.current.addEventListener('input', handleInputChange)
    return () => {
      inputRef.current?.removeEventListener('input', handleInputChange)
    }
  }, [onChange])

  return (
    <div className="autocomplete-container">
      <FormInput placeholder="Event location" ref={inputRef} />
    </div>
  )
}

const GoogleAPIWrapper = ({ children }: { children: React.ReactNode }) => {
  return <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>{children}</APIProvider>
}

interface GoogleMeetLinkProps {
  value: boolean
  onChange: (value: boolean) => void
}

function GoogleMeetLink({ value, onChange }: GoogleMeetLinkProps) {
  return (
    <div
      className="h-10 rounded-2xl border border-light-10 flex items-center justify-between px-3 py-2 cursor-pointer  hover:border-tertiary hover:bg-tertiary"
      onClick={() => onChange(!value)}
    >
      <div className={`flex items-center gap-2 select-none ${value ? 'text-secondary ' : 'text-tertiary'}`}>
        {value ? <GoogleMeetIcon size={20} /> : <Add size={20} />}
        {value ? 'Google Meet included' : 'Add Google Meet video conferencing'}
      </div>
      {value && (
        <span className="text-subtle">
          <XIcon size={20} onClick={() => onChange(false)} />
        </span>
      )}
    </div>
  )
}

export function GoogleCalEventForm(props: GoogleCalEventFormProps) {
  const { mutate: createGoogleCalEvent, isPending } = useCreateGoogleCalEvent(props.onSuccess)

  const form = useForm<z.infer<typeof googleCalEventFormSchema>>({
    resolver: zodResolver(googleCalEventFormSchema),
    shouldFocusError: true,
    defaultValues: {
      summary: props.data.summary,
      location: props.data.location,
      description: `${props.data.description}`,
      start: props.data.start ?? new Date().toISOString(),
      end: props.data.end ?? new Date().toISOString(),
      includeGoogleMeetDetails: false,
    },
  })

  async function onSubmit(data: GoogleCalEventFormSchema) {
    createGoogleCalEvent({
      ...data,
      description: `${props.data.description}\n\nCreated with <a href="https://highlightai.com">Highlight</a>`,
      start: data.start ? new Date(data.start).toISOString() : undefined,
      end: data.end ? new Date(data.end).toISOString() : undefined,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <FormInput placeholder="Event summary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid w-full grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="start"
            render={({ field, fieldState }) => {
              return (
                <FormItem className="col-span-2">
                  <FormLabel>Start date</FormLabel>
                  <FormControl>
                    <DatePickerDropdown field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Start time</FormLabel>
                <FormControl>
                  <TimeSelectDropdown field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="end"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>End date</FormLabel>
                <FormControl>
                  <DatePickerDropdown field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>End time</FormLabel>
                <FormControl>
                  <TimeSelectDropdown field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="includeGoogleMeetDetails"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <GoogleMeetLink value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        ></FormField>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <GoogleAPIWrapper>
                  <PlaceAutocomplete value={field.value ?? ''} onChange={(place) => form.setValue('location', place)} />
                </GoogleAPIWrapper>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <InviteeDropdown /> */}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <FormTextarea placeholder="Event description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <IntegrationSubmitButton isPending={isPending} label="Create event" icon={<GoogleIcon size={20} />} />
      </form>
    </Form>
  )
}

export function CreateGoogleCalEvent(data: CreateGoogleCalendarEventParams) {
  const {
    data: connectedToGoogleCal,
    isLoading: connectionIsLoading,
    isSuccess: connectionCheckSuccess,
  } = useCheckGoogleCalConnection()
  const [state, setState] = React.useState<'form' | 'success'>('form')
  const [url, setUrl] = React.useState<string | undefined>(undefined)
  const queryClient = useQueryClient()

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  if (connectionIsLoading) {
    return <IntegrationsLoader />
  }

  if (connectionCheckSuccess && !connectedToGoogleCal) {
    return (
      <SetupConnection
        name={'Google Calendar'}
        checkConnectionStatus={checkGoogleConnectionStatus}
        onConnect={() => {
          queryClient.invalidateQueries({ queryKey: ['google-cal-check-connection'] })
          setState('form')
        }}
        icon={<GoogleIcon size={16} />}
        createMagicLink={createMagicLinkForGoogle}
      />
    )
  }

  if (connectedToGoogleCal && state === 'form') {
    return <GoogleCalEventForm data={data} onSuccess={onSuccess} />
  }

  if (state === 'success' && url) {
    return (
      <IntegrationSuccessMessage
        heading="Google Calendar event created:"
        url={url}
        title={data.summary}
        subTitle="Google Calendar event"
        icon={<GoogleIcon size={20} />}
      />
    )
  }
}
