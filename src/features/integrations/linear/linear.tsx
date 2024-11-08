import { useState } from 'react'
import InputField from '@/components/TextInput/InputField'
import TextArea from '@/components/TextInput/TextArea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Button from '@/components/Button/Button'
import { z } from 'zod'
import { useCreateLinearTicket } from './hooks'
import React from 'react'

const linearTicketFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
})

export type LinearTicketFormData = z.infer<typeof linearTicketFormSchema>

interface LinearTicketFormProps {
  title: string
  description: string
  onSubmitSuccess: (issueUrl: string) => void
}

export function LinearTicketForm({ title, description, onSubmitSuccess }: LinearTicketFormProps) {
  const { mutate: createLinearTicket } = useCreateLinearTicket(onSubmitSuccess)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LinearTicketFormData>({
    resolver: zodResolver(linearTicketFormSchema),
    defaultValues: {
      title,
      description: description + '\n\nCreated with [Highlight](https://highlightai.com)',
    },
  })

  async function onSubmit(data: LinearTicketFormData) {
    createLinearTicket(data)
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <InputField size={'xxlarge'} label={'Title'} placeholder={'Issue Title'} {...register('title')} />
      <TextArea
        rows={4}
        size={'xxlarge'}
        label={'Description'}
        placeholder={'Issue Description'}
        {...register('description')}
      />
      <Button size={'medium'} variant={'primary'} type={'submit'} disabled={isSubmitting}>
        Create Issue
      </Button>
    </form>
  )
}

export function LinearTicketSuccessMessage({ issueUrl }: { issueUrl: string }) {
  return (
    <>
      Linear issue created:{' '}
      <a href={issueUrl} target="_blank">
        View Issue
      </a>
    </>
  )
}

export function CreateLinearTicketComponent({ title, description }: { title: string; description: string }) {
  const [state, setState] = useState<'form' | 'success'>('form')
  const [issueUrl, setIssueUrl] = useState<string>()

  function onSubmitSuccess(issueUrl: string) {
    setIssueUrl(issueUrl)
    setState('success')
  }

  return (
    <div className="mt-2">
      {state === 'form' && (
        <LinearTicketForm title={title} description={description} onSubmitSuccess={onSubmitSuccess} />
      )}
      {state === 'success' && issueUrl && <LinearTicketSuccessMessage issueUrl={issueUrl} />}
    </div>
  )
}
