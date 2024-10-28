import type { CreateGoogleCalendarEventParams } from '@/hooks/useIntegrations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InputField from '../TextInput/InputField'
import TextArea from '../TextInput/TextArea'
import Button from '../Button/Button'
import { createGoogleCalendarEvent } from '@/utils/google-server-actions'
import { ConfigProvider, DatePicker } from 'antd'

const { RangePicker } = DatePicker

const gcalEventFormSchema = z.object({
  summary: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
})

type GcalEventFormData = z.infer<typeof gcalEventFormSchema>

export function GcalEventFormComponent({
  data,
  onSuccess,
}: {
  data: CreateGoogleCalendarEventParams
  onSuccess: (url: string) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GcalEventFormData>({
    resolver: zodResolver(gcalEventFormSchema),
    defaultValues: {
      summary: data.summary,
      location: data.location,
      description: data.description,
      start: data.start,
      end: data.end,
    },
  })

  async function onSubmit(data: GcalEventFormData) {
    // @ts-ignore
    const token = await highlight.internal.getAuthorizationToken()

    const link = await createGoogleCalendarEvent(token, data)

    onSuccess(link ?? '')
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <InputField size={'xxlarge'} label={'Summary'} placeholder={'Event Summary'} {...register('summary')} />
      <InputField size={'xxlarge'} label={'Location'} placeholder={'Event Location'} {...register('location')} />
      <TextArea
        rows={4}
        size={'xxlarge'}
        label={'Description'}
        placeholder={'Issue Description'}
        {...register('description')}
      />
      <ConfigProvider
        theme={{
          token: {},
          components: {
            DatePicker: {
              colorBgContainer: 'rgba(255, 255, 255, 0.05)',
              colorBorder: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              colorPrimaryHover: 'rgba(255, 255, 255, 0.2)',
              colorTextPlaceholder: 'rgba(255, 255, 255, 0.2)',
              activeBorderColor: 'rgba(255, 255, 255, 0.4)',
            },
          },
        }}
      >
        <RangePicker onChange={(value) => console.log(value)} showTime />
      </ConfigProvider>
      <InputField size={'xxlarge'} label={'Start'} placeholder={'Event Start'} {...register('start')} />
      <InputField size={'xxlarge'} label={'End'} placeholder={'Event End'} {...register('end')} />
      <Button size={'medium'} variant={'primary'} type={'submit'} disabled={isSubmitting}>
        Create Event
      </Button>
    </form>
  )
}

export function CreateGoogleCalendarEventComponent(data: CreateGoogleCalendarEventParams) {
  const [state, setState] = useState<'form' | 'success'>('form')
  const [url, setUrl] = useState<string | undefined>(undefined)

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  return (
    <div className="mt-2">
      {state === 'form' && <GcalEventFormComponent data={data} onSuccess={onSuccess} />}
      {state === 'success' && url && (
        <span>
          Google Calendar event created successfully:{' '}
          <a href={url} target="_blank">
            {url}
          </a>
        </span>
      )}
    </div>
  )
}
