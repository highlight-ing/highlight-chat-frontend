import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InputField from '@/components/TextInput/InputField'
import TextArea from '@/components/TextInput/TextArea'
import Button from '@/components/Button/Button'
import { useEffect, useId, useState } from 'react'
import { NotionIcon } from '@/icons/icons'
import { SetupConnectionComponent } from './integration-auth'
import {
  checkNotionConnectionStatus,
  createMagicLinkForNotion,
  getNotionTokenForUser,
  getNotionParentItems,
  createNotionPage,
} from '@/utils/notion-server-actions'
import { Text } from 'react-notion-x'
import ContextMenu, { MenuItemType } from '../ContextMenu/ContextMenu'
import { NotionParentItem } from '@/types'
import { ArrowDown2 } from 'iconsax-react'
import { emptyTextBlock, mapNotionDecorations } from '@/utils/notion'
import Markdown from 'react-markdown'

interface CreateNotionPageComponentProps {
  title: string
  content: string
}

const notionPageFormSchema = z.object({
  title: z.string().min(1),
})

type NotionPageFormData = z.infer<typeof notionPageFormSchema>
type ItemWithDecorations = ReturnType<typeof mapNotionDecorations>[number]

function ParentItemDropdown({
  items,
  onSelect,
}: {
  items: NotionParentItem[]
  onSelect: (item: ItemWithDecorations) => void
}) {
  const triggerId = useId()
  const itemsWithDecorations = mapNotionDecorations(items)

  const contextMenuItems: MenuItemType[] = itemsWithDecorations.map((item) => {
    return {
      label: <Text value={item.decorations} block={emptyTextBlock} />,
      onClick: () => {
        onSelect(item)
        setSelectedItem(item)
      },
    }
  })

  const [selectedItem, setSelectedItem] = useState<ItemWithDecorations | null>(itemsWithDecorations[0])

  return (
    <ContextMenu
      key="templates-menu"
      items={contextMenuItems}
      position={'bottom'}
      triggerId={triggerId}
      leftClick={true}
    >
      {
        <Button id={triggerId} size={'medium'} variant={'tertiary'}>
          <ArrowDown2 size={16} />
          {selectedItem ? <Text value={selectedItem.decorations} block={emptyTextBlock} /> : 'Error Loading Items'}
        </Button>
      }
    </ContextMenu>
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

  async function loadParentItems(token: string) {
    const items = await getNotionParentItems(token)
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
    console.log('Submitting form', data)
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
      content,
    })

    onSuccess(response ?? undefined)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Parent Item</span>
      <span className="text-xs text-gray-500">You must select a parent item to create the page in</span>
      {parentItems.length > 0 && <ParentItemDropdown items={parentItems} onSelect={setSelectedParentItem} />}
      {parentItems.length === 0 && <span>Loading Items...</span>}
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <InputField size={'xxlarge'} label={'Title'} placeholder={'Issue Title'} {...register('title')} />
        <Markdown>{content}</Markdown>
        <Button size={'medium'} variant={'primary'} type={'submit'} disabled={isSubmitting}>
          Create Page
        </Button>
      </form>
    </div>
  )
}

export function CreateNotionPageComponent({ title, content }: CreateNotionPageComponentProps) {
  const [state, setState] = useState<'loading' | 'connect' | 'form' | 'success'>('loading')
  const [url, setUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    // On mount, check to see if the user has setup Linear integration
    async function checkStatus() {
      // @ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkNotionConnectionStatus(hlToken)

      if (connected) {
        setState('form')
      } else {
        setState('connect')
      }
    }

    checkStatus()
  }, [])

  function onConnect() {
    setState('form')
  }

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  return (
    <div className="mt-2">
      {state === 'connect' && (
        <SetupConnectionComponent
          name={'Notion'}
          checkConnectionStatus={checkNotionConnectionStatus}
          onConnect={onConnect}
          icon={<NotionIcon size={16} />}
          createMagicLink={createMagicLinkForNotion}
        />
      )}
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
