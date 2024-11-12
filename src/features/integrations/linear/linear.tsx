import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateLinearTicket, useLinearAssignees, useLinearWorkflowStates } from './hooks'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LinearIcon } from '@/icons/icons'
import { IntegrationSubmitButton } from '../components/submit-button'
import { IntegrationSuccessMessage } from '../components/success-message'
import { IntegrationWrapper } from '../components/integration-wrapper'

const linearTicketFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  status: z.string().optional(),
  assignee: z.string().optional(),
})

export type LinearTicketFormData = z.infer<typeof linearTicketFormSchema>

interface LinearTicketFormProps {
  title: string
  description: string
  onSubmitSuccess?: (url: string) => void
}

function LinearTicketForm({ title, description, onSubmitSuccess }: LinearTicketFormProps) {
  const { mutate: createLinearTicket, isPending } = useCreateLinearTicket(onSubmitSuccess)
  const { data: workflowStates } = useLinearWorkflowStates()
  const { data: assignees } = useLinearAssignees()

  const form = useForm<z.infer<typeof linearTicketFormSchema>>({
    resolver: zodResolver(linearTicketFormSchema),
    defaultValues: {
      title,
      description: description + '\n\nCreated with [Highlight](https://highlightai.com)',
      status: '',
      assignee: '',
    },
  })

  async function onSubmit(data: LinearTicketFormData) {
    createLinearTicket(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger value={field.value}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64" sideOffset={4}>
                      {workflowStates?.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger value={field.value}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64" sideOffset={4}>
                      {assignees?.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <IntegrationSubmitButton isPending={isPending} label="Create ticket" icon={<LinearIcon size={20} />} />
      </form>
    </Form>
  )
}

type CreateLinearTicketProps = {
  title: string
  description: string
}

export function CreateLinearTicket(props: CreateLinearTicketProps) {
  const [state, setState] = React.useState<'form' | 'success'>('form')
  const [issueUrl, setIssueUrl] = React.useState('')

  function onSubmitSuccess(issueUrl: string) {
    setIssueUrl(issueUrl)
    setState('success')
  }

  if (state === 'form') {
    return (
      <IntegrationWrapper>
        <LinearTicketForm title={props.title} description={props.description} onSubmitSuccess={onSubmitSuccess} />
      </IntegrationWrapper>
    )
  }

  if (state === 'success' && issueUrl) {
    return (
      <IntegrationWrapper>
        <IntegrationSuccessMessage
          heading="Linear issue created:"
          url={issueUrl}
          title={props.title}
          subTitle="Linear issue"
          icon={<LinearIcon size={20} />}
        />
      </IntegrationWrapper>
    )
  }
}
