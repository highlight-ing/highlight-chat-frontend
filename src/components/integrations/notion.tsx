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

// Add logging utility
const logError = (context: string, error: any) => {
  console.error(`[Notion Integration Error] ${context}:`, {
    message: error?.message,
    stack: error?.stack,
    response: error?.response?.data,
    status: error?.response?.status,
    timestamp: new Date().toISOString(),
  });
};

interface CreateNotionPageComponentProps {
  title: string
  content: string
}

const notionPageFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

type NotionPageFormData = z.infer<typeof notionPageFormSchema>

function ParentItemDropdown({
  items,
  onSelect,
  disabled = false,
}: {
  items: NotionParentItem[]
  onSelect: (item: NotionParentItem) => void
  disabled?: boolean
}) {
  const triggerId = useId()
  const [selectedItem, setSelectedItem] = useState<NotionParentItem | null>(null)

  useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      const initialItem = items[0]
      setSelectedItem(initialItem)
      onSelect(initialItem)
    }
  }, [items, selectedItem, onSelect])

  const handleItemSelect = (item: NotionParentItem) => {
    setSelectedItem(item)
    onSelect(item)
  }

  if (!items.length) {
    return <span className="text-sm text-gray-500">Loading available locations...</span>
  }

  return (
    <NotionDropdown
      onItemSelect={handleItemSelect}
      items={items}
      key="templates-menu"
      position={'bottom'}
      triggerId={triggerId}
      leftClick={true}
      disabled={disabled}
    >
      {({ isOpen }: { isOpen: boolean }) => (
        <Button id={triggerId} size={'medium'} variant={'tertiary'} disabled={disabled}>
          {selectedItem?.type === 'database' ? (
            <Grid6 variant="Bold" size={16} />
          ) : (
            <Document variant="Bold" size={16} />
          )}
          {selectedItem ? (
            <Text value={getDecorations(selectedItem.title)} block={emptyTextBlock} />
          ) : (
            'Select a location'
          )}
          {isOpen ? <ArrowDown2 size={16} /> : <ArrowUp2 size={16} />}
        </Button>
      )}
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
  const [error, setError] = useState<string | null>(null)

  const contentWithFooter = `${content.replace(/$$([^$$]+)\]$[^$]+\)/g, '$1')}\n\nCreated with [Highlight](https://highlightai.com)`

  async function loadParentItems(token: string) {
    try {
      const items = await getNotionParentItems(token)
      if (items.length > 0) {
        setParentItems(items)
      } else {
        const errorMsg = 'No available locations found in your Notion workspace'
        logError('LoadParentItems', { 
          type: 'NO_LOCATIONS',
          token: token ? 'Present' : 'Missing',
          itemsLength: items.length 
        })
        setError(errorMsg)
      }
    } catch (err) {
      logError('LoadParentItems', err)
      setError('Failed to load Notion locations')
    }
  }

  useEffect(() => {
    async function initializeNotion() {
      try {
        // @ts-ignore
        const hlToken = (await highlight.internal.getAuthorizationToken()) as string
        const token = await getNotionTokenForUser(hlToken)

        if (!token) {
          logError('InitializeNotion', { error: 'No token returned' })
          setError('Notion authentication failed. Please reconnect your account.')
          return
        }

        setNotionToken(token)
        await loadParentItems(token)
      } catch (err) {
        logError('InitializeNotion', err)
        setError('Failed to initialize Notion connection')
      }
    }

    initializeNotion()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotionPageFormData>({
    resolver: zodResolver(notionPageFormSchema),
    defaultValues: {
      title,
    },
  })

  async function onSubmit(data: NotionPageFormData) {
    try {
      setError(null)

      if (!notionToken) {
        logError('FormSubmission', { error: 'No Notion token available' })
        setError('Notion connection not established')
        return
      }

      if (!selectedParentItem) {
        logError('FormSubmission', { error: 'No parent item selected' })
        setError('Please select a location for your page')
        return
      }

      const response = await createNotionPage({
        accessToken: notionToken,
        parent: selectedParentItem,
        title: data.title,
        content: contentWithFooter,
      })

      onSuccess(response ?? undefined)
    } catch (err) {
      logError('FormSubmission', err)
      setError('Failed to create Notion page')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`${styles.notionInputField} flex flex-col gap-2 bg-inherit p-[20px]`}>
        <span className="text-sm font-medium">Location</span>
        <span className="text-xs text-gray-500">Select where to create your new page</span>
        <ParentItemDropdown 
          items={parentItems} 
          onSelect={setSelectedParentItem} 
          disabled={isSubmitting}
        />
      </div>

      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          size={'xxlarge'}
          label={'Title'}
          placeholder={'Page Title'}
          error={errors.title?.message}
          disabled={isSubmitting}
          {...register('title')}
        />

        <div className={'relative flex flex-col gap-2'}>
          <span className={`${styles.inputLabel} ${styles.inline} ${styles.visible}`}>Page Contents</span>
          <div className={`${styles.inputField} p-[20px]`}>
            <Markdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {contentWithFooter}
            </Markdown>
          </div>
        </div>

        {error && (
          <div className="text-sm">
            <div className="text-red-500">{error}</div>
            <details className="mt-2 text-gray-500">
              <summary>Debug Information</summary>
              <pre className="mt-2 text-xs">
                {JSON.stringify({
                  hasToken: !!notionToken,
                  parentItemsCount: parentItems.length,
                  selectedParent: selectedParentItem?.id,
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <Button 
          size={'medium'} 
          variant={'primary'} 
          type={'submit'} 
          disabled={isSubmitting || !selectedParentItem}
        >
          {isSubmitting ? 'Creating Page...' : 'Create Page'}
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
      {state === 'success' && (
        <div className="text-sm">
          {url ? (
            <span>
              Page created successfully:{' '}
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {url}
              </a>
            </span>
          ) : (
            <span>Page created successfully!</span>
          )}
        </div>
      )}
    </div>
  )
}
