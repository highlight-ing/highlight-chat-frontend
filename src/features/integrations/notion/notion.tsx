import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { z } from 'zod'
import { checkNotionConnectionStatus, createMagicLinkForNotion } from './actions'
import { Text } from 'react-notion-x'
import { Grid6, Document } from 'iconsax-react'
import { emptyTextBlock, getDecorations } from './utils'
import Markdown from 'react-markdown'
import { NotionIcon } from '@/icons/icons'
import { useCheckNotionConnection, useCreateNotionPage, useNotionParentItems } from './hooks'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { IntegrationSubmitButton } from '../components/submit-button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IntegrationsLoader } from '../components/loader'
import { SetupConnection } from '../components/setup-connection'
import { IntegrationSuccessMessage } from '../components/success-message'
import { useQueryClient } from '@tanstack/react-query'

const notionPageFormSchema = z.object({
  title: z.string().min(1),
  parentId: z.string(),
})

export type NotionPageFormSchema = z.infer<typeof notionPageFormSchema>

type NotionFormDropdownProps = {
  field: ControllerRenderProps<NotionPageFormSchema>
}

function ParentDropdown(props: NotionFormDropdownProps) {
  const { data: parentItems } = useNotionParentItems()

  return (
    <Select value={props.field.value} onValueChange={props.field.onChange}>
      <SelectTrigger value={props.field.value}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent sideOffset={4}>
        <SelectGroup>
          <SelectLabel>Databases</SelectLabel>
          {parentItems
            ?.filter((item) => item.type === 'database')
            .map((database) => (
              <SelectItem key={database.id} value={database.id}>
                <div className="flex items-center gap-2">
                  <div className="grid size-5 place-items-center">
                    <Grid6 variant="Bold" size={20} />
                  </div>
                  <div className="line-clamp-1 text-[13px] font-medium leading-none text-primary/60">
                    <Text value={getDecorations(database.title)} block={emptyTextBlock} />
                  </div>
                </div>
              </SelectItem>
            ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Pages</SelectLabel>
          {parentItems
            ?.filter((item) => item.type === 'page')
            .map((page) => (
              <SelectItem key={page.id} value={page.id}>
                <div className="flex items-center gap-2">
                  <div className="grid size-5 place-items-center">
                    <Document variant="Bold" size={20} />
                  </div>
                  <div className="line-clamp-1 text-[13px] font-medium leading-none text-primary/60">
                    <Text value={getDecorations(page.title)} block={emptyTextBlock} />
                  </div>
                </div>
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

type NotionFormProps = {
  title: string
  content: string
  onSuccess: (url?: string) => void
}

function NotionPageForm(props: NotionFormProps) {
  const { mutate: createNotionPage, isPending } = useCreateNotionPage(props.onSuccess)

  const contentWithFooter =
    props.content.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') + '\n\nCreated with [Highlight](https://highlightai.com)'

  const form = useForm<z.infer<typeof notionPageFormSchema>>({
    resolver: zodResolver(notionPageFormSchema),

    defaultValues: {
      title: props.title,
      parentId: '',
    },
  })

  async function onSubmit(data: NotionPageFormSchema) {
    createNotionPage({ formData: data, contentWithFooter })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent</FormLabel>
              <FormControl>
                <ParentDropdown field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Page title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Page Contents</FormLabel>
          <div className="relative flex !h-fit min-h-36 w-full resize-none flex-col justify-start gap-2 rounded-2xl border border-light-10 bg-secondary bg-transparent px-3 pb-2 pt-7 text-[15px] text-base text-primary shadow-sm outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
            <Markdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank">
                    {children}
                  </a>
                ),
              }}
            >
              {contentWithFooter}
            </Markdown>
          </div>
        </FormItem>

        <IntegrationSubmitButton isPending={isPending} label="Create page" icon={<NotionIcon size={20} />} />
      </form>
    </Form>
  )
}

type CreateNotionPageProps = {
  title: string
  content: string
}

export function CreateNotionPage(props: CreateNotionPageProps) {
  const { data: connectedToNotion, isLoading: connectionIsLoading } = useCheckNotionConnection()
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

  if (!connectedToNotion) {
    return (
      <SetupConnection
        name={'Notion'}
        checkConnectionStatus={checkNotionConnectionStatus}
        onConnect={() => {
          queryClient.invalidateQueries({ queryKey: ['notion-api-token'] })
          setState('form')
        }}
        icon={<NotionIcon size={16} />}
        createMagicLink={createMagicLinkForNotion}
      />
    )
  }

  if (state === 'form') {
    return <NotionPageForm title={props.title} content={props.content} onSuccess={onSuccess} />
  }

  if (state === 'success' && url) {
    return (
      <IntegrationSuccessMessage
        heading="Notion page created:"
        url={url}
        title={props.title}
        subTitle="Notion page"
        icon={<NotionIcon size={20} />}
      />
    )
  }
}
