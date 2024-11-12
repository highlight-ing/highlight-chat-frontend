import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCheckLinearConnection, useCreateLinearTicket, useLinearAssignees, useLinearWorkflowStates } from './hooks'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LinearIcon } from '@/icons/icons'
import { IntegrationSubmitButton } from '../components/submit-button'
import { IntegrationSuccessMessage } from '../components/success-message'
import { IntegrationsLoader } from '../components/loader'
import { SetupConnection } from '../components/setup-connection'
import { checkLinearConnectionStatus, createMagicLinkForLinear } from './actions'
import { useQueryClient } from '@tanstack/react-query'

const linearTicketFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  status: z.string().optional(),
  assignee: z.string().optional(),
})

export type LinearTicketFormSchema = z.infer<typeof linearTicketFormSchema>

type LinearFormDropdownProps = {
  field: ControllerRenderProps<LinearTicketFormSchema>
}

function WorkflowStatesDropdown(props: LinearFormDropdownProps) {
  const { data: workflowStates } = useLinearWorkflowStates()

  return (
    <Select value={props.field.value} onValueChange={props.field.onChange}>
      <SelectTrigger value={props.field.value}>
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
  )
}

function AssigneesDropdown(props: LinearFormDropdownProps) {
  const { data: assignees } = useLinearAssignees()

  return (
    <Select value={props.field.value} onValueChange={props.field.onChange}>
      <SelectTrigger value={props.field.value}>
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
  )
}

interface LinearTicketFormProps {
  title: string
  description: string
  onSubmitSuccess?: (url: string) => void
}

function LinearTicketForm({ title, description, onSubmitSuccess }: LinearTicketFormProps) {
  const { mutate: createLinearTicket, isPending } = useCreateLinearTicket(onSubmitSuccess)

  const form = useForm<z.infer<typeof linearTicketFormSchema>>({
    resolver: zodResolver(linearTicketFormSchema),
    defaultValues: {
      title,
      description: description + '\n\nCreated with [Highlight](https://highlightai.com)',
      status: '',
      assignee: '',
    },
  })

  async function onSubmit(data: LinearTicketFormSchema) {
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
                  <WorkflowStatesDropdown field={field} />
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
                  <AssigneesDropdown field={field} />
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
  const { data: connectedToLinear, isLoading: connectionIsLoading } = useCheckLinearConnection()
  const [state, setState] = React.useState<'form' | 'success'>('form')
  const [issueUrl, setIssueUrl] = React.useState('')
  const queryClient = useQueryClient()

  function onSubmitSuccess(issueUrl: string) {
    setIssueUrl(issueUrl)
    setState('success')
  }

  if (connectionIsLoading) {
    return <IntegrationsLoader />
  }

  if (!connectedToLinear) {
    return (
      <SetupConnection
        name={'Linear'}
        checkConnectionStatus={checkLinearConnectionStatus}
        onConnect={() => {
          queryClient.invalidateQueries({ queryKey: ['linear-api-token'] })
          setState('form')
        }}
        icon={<LinearIcon size={16} />}
        createMagicLink={createMagicLinkForLinear}
      />
    )
  }

  if (state === 'form') {
    return <LinearTicketForm title={props.title} description={props.description} onSubmitSuccess={onSubmitSuccess} />
  }

  if (state === 'success' && issueUrl) {
    return (
      <IntegrationSuccessMessage
        heading="Linear issue created:"
        url={issueUrl}
        title={props.title}
        subTitle="Linear issue"
        icon={<LinearIcon size={20} />}
      />
    )
  }
}
