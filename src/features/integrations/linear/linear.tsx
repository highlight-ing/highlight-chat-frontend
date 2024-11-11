import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateLinearTicket, useLinearAssignees, useLinearWorkflowStates } from './hooks'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Button from '@/components/Button/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AnimatePresence, motion } from 'framer-motion'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { LinearIcon } from '@/icons/icons'

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

        <Button size={'medium'} variant={'accent'} type={'submit'} disabled={isPending} style={{ gap: 8 }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={isPending ? 'true' : 'false'}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              {isPending ? (
                <LoadingSpinner size={'20px'} />
              ) : (
                <div className="size-5 overflow-hidden rounded-md">
                  <LinearIcon size={20} />
                </div>
              )}
            </motion.span>
          </AnimatePresence>
          Create Issue
        </Button>
      </form>
    </Form>
  )
}

type LinearTicketSuccessMessageProps = {
  issueUrl: string
  ticketTitle: string
}

function LinearTicketSuccessMessage(props: LinearTicketSuccessMessageProps) {
  return (
    <div className="flex flex-col gap-3">
      <p>Linear issue created:</p>
      <a href={props.issueUrl} target="_blank" style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <div className="flex h-[48px] w-fit items-center gap-2.5 text-nowrap rounded-[16px] border border-light-10 bg-secondary p-[5px] pr-2 text-base leading-none">
          <div className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-light-5 text-primary">
            <div className="size-5 overflow-hidden rounded-md">
              <LinearIcon size={20} />
            </div>
          </div>
          <div className="">
            <p className="truncate text-sm font-medium text-secondary">{props.ticketTitle}</p>
            <p className="text-xs text-tertiary">Linear issue</p>
          </div>
        </div>
      </a>
    </div>
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

  return (
    <div className="mt-2">
      {state === 'form' && (
        <LinearTicketForm title={props.title} description={props.description} onSubmitSuccess={onSubmitSuccess} />
      )}
      {state === 'success' && issueUrl && <LinearTicketSuccessMessage issueUrl={issueUrl} ticketTitle={props.title} />}
    </div>
  )
}
