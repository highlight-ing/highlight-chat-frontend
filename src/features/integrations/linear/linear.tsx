import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateLinearTicket, useLinearAssignees, useLinearClient, useLinearWorkflows } from './hooks'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Button from '@/components/Button/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const linearTicketFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  status: z.string(),
  assignee: z.string(),
})

export type LinearTicketFormData = z.infer<typeof linearTicketFormSchema>

interface LinearTicketFormProps {
  title: string
  description: string
  onSubmitSuccess?: (issueUrl: string) => void
}

export function LinearTicketForm({ title, description, onSubmitSuccess }: LinearTicketFormProps) {
  const { mutate: createLinearTicket } = useCreateLinearTicket(onSubmitSuccess)
  const { data: workflows } = useLinearWorkflows()
  const { data: assignees } = useLinearAssignees()

  const form = useForm<z.infer<typeof linearTicketFormSchema>>({
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <p className="text-[15px] font-normal text-primary">I will help you create a linear issue:</p>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Ticket title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Ticket description" className="max-w-lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger value={field.value}>
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64" sideOffset={4}>
                    {assignees
                      ? assignees.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </SelectItem>
                      ))
                      : 'No assignees found'}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button size={'medium'} variant={'primary'} type={'submit'}>
          Create Issue
        </Button>
      </form>
    </Form>
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

export function CreateLinearTicket({ title, description }: { title: string; description: string }) {
  const [state, setState] = React.useState<'form' | 'success'>('form')
  const [issueUrl, setIssueUrl] = React.useState<string>()

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
