import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InputField from '@/components/TextInput/InputField'
import Button from '@/components/Button/Button'
import { useEffect, useId, useState } from 'react'
import { getNotionTokenForUser, getNotionParentItems, createNotionPage } from '@/utils/notion-server-actions'
import { Text } from 'react-notion-x'
import { NotionParentItem } from '@/types'
import { ArrowDown2, ArrowUp2, Grid6, Document } from 'iconsax-react'
import { emptyTextBlock, getDecorations, mapNotionDecorations } from '@/utils/notion'
import Markdown from 'react-markdown'
import styles from '../TextInput/inputfield.module.scss'
import NotionDropdown from '../dropdowns/notion/notion-dropdown'

interface CreateNotionPageComponentProps {
  title: string
  content: string
}

const notionPageFormSchema = z.object({
  title: z.string().min(1),
})

type NotionPageFormData = z.infer<typeof notionPageFormSchema>

function ParentItemDropdown({
  items,
  onSelect,
}: {
  items: NotionParentItem[]
  onSelect: (item: NotionParentItem) => void
}) {
  const triggerId = useId()

  const [selectedItem, setSelectedItem] = useState<NotionParentItem | null>(items[0])

  const handleItemSelect = (item: NotionParentItem) => {
    setSelectedItem(item)
    onSelect(item)
  }

  return (
    <NotionDropdown
      onItemSelect={handleItemSelect}
      items={items}
      key="templates-menu"
      position={'bottom'}
      triggerId={triggerId}
      leftClick={true}
    >
      {
        // @ts-ignore
        ({ isOpen }) => (
          <Button id={triggerId} size={'medium'} variant={'tertiary'}>
            {selectedItem?.type === 'database' ? (
              <Grid6 variant="Bold" size={16} />
            ) : (
              <Document variant="Bold" size={16} />
            )}
            {selectedItem ? (
              <Text value={getDecorations(selectedItem.title)} block={emptyTextBlock} />
            ) : (
              'Error Loading Items'
            )}
            {isOpen && <ArrowDown2 size={16} />}
            {!isOpen && <ArrowUp2 size={16} />}
          </Button>
        )
      }
    </NotionDropdown>
  )
}

function FormComponent({
  title,
  content,
  onSuccess,
}: {
  title: string
  content: string
  onSuccess: (url?: string) => void
}) {
  const [notionToken, setNotionToken] = useState<string | null>(null)
  const [parentItems, setParentItems] = useState<NotionParentItem[]>([])
  const [selectedParentItem, setSelectedParentItem] = useState<NotionParentItem | null>(null)

  const contentWithFooter =
    content.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') + '\n\nCreated with [Highlight](https://highlightai.com)'

  async function loadParentItems(token: string) {
    const items = await getNotionParentItems(token)
    console.log(items)
    setParentItems(items)
    setSelectedParentItem(items[0])
  }

  useEffect(() => {
    async function getLinearToken() {
      // @ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const token = await getNotionTokenForUser(hlToken)

      if (!token) {
        console.warn('Something is wrong, no Notion token found for user but we are in the Notion form')
        return
      }

      loadParentItems(token)
      setNotionToken(token)
    }

    getLinearToken()
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NotionPageFormData>({
    resolver: zodResolver(notionPageFormSchema),
    defaultValues: {
      title,
    },
  })

  async function onSubmit(data: NotionPageFormData) {
    if (!notionToken) {
      // TODO (Julian): Add more advanced error message here
      console.warn('Token not set, please try again later.')
      return
    }

    if (!selectedParentItem) {
      console.warn('Parent item not selected')
      return
    }

    const response = await createNotionPage({
      accessToken: notionToken,
      parent: selectedParentItem,
      title: data.title,
      content: contentWithFooter,
    })

    onSuccess(response ?? undefined)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`${styles.notionInputField} flex flex-col gap-2 bg-inherit p-[20px]`}>
        <span className="text-sm font-medium">Parent</span>
        <span className="text-xs text-gray-500">You must select a parent item to create the page in</span>
        {parentItems.length > 0 && <ParentItemDropdown items={parentItems} onSelect={setSelectedParentItem} />}
        {parentItems.length === 0 && <span>Loading Items...</span>}
      </div>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <InputField size={'xxlarge'} label={'Title'} placeholder={'Issue Title'} {...register('title')} />
        <div className={'relative flex flex-col gap-2'}>
          <span className={`${styles.inputLabel} ${styles.inline} ${styles.visible}`}>Page Contents</span>

          <div className={`${styles.inputField} p-[20px]`}>
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
        </div>
        <Button size={'medium'} variant={'primary'} type={'submit'} disabled={isSubmitting}>
          Create Page
        </Button>
      </form>
    </div>
  )
}

export function CreateNotionPageComponent({ title, content }: CreateNotionPageComponentProps) {
  const [state, setState] = useState<'form' | 'success'>('form')
  const [url, setUrl] = useState<string | undefined>(undefined)

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  return (
    <div className="mt-2">
      {state === 'form' && <FormComponent title={title} content={content} onSuccess={onSuccess} />}
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
