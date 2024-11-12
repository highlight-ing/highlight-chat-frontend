import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import {
  getNotionTokenForUser,
  getNotionParentItems,
  createNotionPage,
  checkNotionConnectionStatus,
  createMagicLinkForNotion,
} from '@/utils/notion-server-actions'
import { Text } from 'react-notion-x'
import { Grid6, Document } from 'iconsax-react'
import { emptyTextBlock, getDecorations, mapNotionDecorations } from '@/utils/notion'
import Markdown from 'react-markdown'
import styles from '@/components/TextInput/inputfield.module.scss'
import { NotionIcon } from '@/icons/icons'
import { useCreateNotionPage, useNotionParentItems } from './hooks'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { IntegrationSubmitButton } from '../submit-button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SetupConnectionComponent } from '@/components/integrations/integration-auth'
import { IntegrationsLoader } from '@/components/integrations/loader'
import { Textarea } from '@/components/ui/textarea'

const notionPageFormSchema = z.object({
  title: z.string().min(1),
  parentId: z.string(),
})

export type NotionPageFormSchema = z.infer<typeof notionPageFormSchema>

type NotionFormProps = {
  title: string
  content: string
  onSuccess: (url?: string) => void
}

function NotionForm(props: NotionFormProps) {
  const { data: parentItems } = useNotionParentItems()
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger value={field.value}>
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
                              <div className="text-ellipsis text-[13px] font-medium leading-none text-primary/60">
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
                              <div className="text-ellipsis text-[13px] font-medium leading-none text-primary/60">
                                <Text value={getDecorations(page.title)} block={emptyTextBlock} />
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
          <div className="relative flex !h-fit min-h-36 w-full resize-none flex-col justify-start gap-2 rounded-[10px] border border-light-10 bg-secondary bg-transparent px-3 pb-2 pt-7 text-[15px] text-base text-primary shadow-sm outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
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
  const [state, setState] = useState<'loading' | 'connect' | 'form' | 'success'>('loading')
  const [url, setUrl] = useState<string | undefined>(undefined)

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  useEffect(() => {
    async function checkConnection() {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkNotionConnectionStatus(hlToken)
      if (connected) {
        setState('form')
      } else {
        setState('connect')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="mt-2">
      {state === 'loading' && <IntegrationsLoader />}
      {state === 'connect' && (
        <SetupConnectionComponent
          name={'Notion'}
          checkConnectionStatus={checkNotionConnectionStatus}
          onConnect={() => setState('form')}
          icon={<NotionIcon size={16} />}
          createMagicLink={createMagicLinkForNotion}
        />
      )}
      {state === 'form' && <NotionForm title={props.title} content={props.content} onSuccess={onSuccess} />}
      {state === 'success' && url && (
        <span>
          Page created successfully:{' '}
          <a href={url} target="_blank">
            {url}
          </a>
        </span>
      )}
    </div>
  )
}
