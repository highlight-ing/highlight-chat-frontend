import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Document, Grid6 } from 'iconsax-react'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import Markdown from 'react-markdown'
import { Text } from 'react-notion-x'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormSelectTrigger,
} from '@/components/ui/form'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue } from '@/components/ui/select'
import { NotionIcon } from '@/components/icons'

import { IntegrationsLoader } from '../_components/loader'
import { SetupConnection } from '../_components/setup-connection'
import { IntegrationSubmitButton } from '../_components/submit-button'
import { IntegrationSuccessMessage } from '../_components/success-message'
import { checkNotionConnectionStatus, createMagicLinkForNotion } from './actions'
import { useCheckNotionConnection, useCreateNotionPage, useNotionParentItems } from './hooks'
import { emptyTextBlock, getDecorations } from './utils'

const notionPageFormSchema = z.object({
  title: z.string().min(1),
  parentId: z.string().min(1, 'You must select a parent'),
})

export type NotionPageFormSchema = z.infer<typeof notionPageFormSchema>

type NotionFormDropdownProps = {
  field: ControllerRenderProps<NotionPageFormSchema>
}

function ParentDropdown(props: NotionFormDropdownProps) {
  const { data: parentItems } = useNotionParentItems()

  return (
    <Select value={props.field.value} onValueChange={props.field.onChange}>
      <FormSelectTrigger value={props.field.value}>
        <SelectValue placeholder="Select a parent" />
      </FormSelectTrigger>
      <SelectContent sideOffset={4} className="max-h-[270px]">
        <SelectGroup>
          <SelectLabel>Databases</SelectLabel>
          {parentItems
            ?.filter((item) => item.type === 'database')
            .map((database) => (
              <SelectItem key={database.id} value={database.id}>
                <div className="flex w-full items-center gap-2">
                  <div className="size-5 grid place-items-center">
                    <Grid6 variant="Bold" size={20} />
                  </div>
                  <div className="truncate text-[13px] font-medium leading-none text-primary/60">
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
                <div className="flex flex-shrink items-center gap-2">
                  <div className="size-5 grid place-items-center">
                    <Document variant="Bold" size={20} />
                  </div>
                  <div className="truncate text-[13px] font-medium leading-none text-primary/60">
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
                <FormInput placeholder="Page title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Page Contents</FormLabel>
          <div className="min-h-36 relative flex !h-fit w-full resize-none flex-col justify-start gap-2 rounded-2xl border border-light-10 bg-secondary bg-transparent px-3 pb-2 pt-7 text-[15px] text-base text-primary shadow-sm outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
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
  const [state, setState] = React.useState<'form' | 'success'>('form')
  const [url, setUrl] = React.useState<string | undefined>(undefined)
  const queryClient = useQueryClient()

  const {
    data: connectedToNotion,
    isLoading: connectionIsLoading,
    isSuccess: connectionCheckSuccess,
  } = useCheckNotionConnection()

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  if (connectionIsLoading) {
    return <IntegrationsLoader />
  }

  if (connectionCheckSuccess && !connectedToNotion) {
    return (
      <SetupConnection
        name={'Notion'}
        checkConnectionStatus={checkNotionConnectionStatus}
        onConnect={() => {
          queryClient.invalidateQueries({ queryKey: ['notion-api-token'] })
          queryClient.invalidateQueries({ queryKey: ['notion-check-connection'] })
          setState('form')
        }}
        icon={<NotionIcon size={16} />}
        createMagicLink={createMagicLinkForNotion}
      />
    )
  }

  if (connectedToNotion && state === 'form') {
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
