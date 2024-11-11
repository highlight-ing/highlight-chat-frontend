import { SendSlackMessageParams } from '@/hooks/useIntegrations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InputField from '@/components/TextInput/InputField'
import Button from '@/components/Button/Button'
import { sendMessage, listChannels } from '@/utils/slack-server-actions'
import { getIntegrationTokenForUser } from '@/utils/integrations-server-actions'
import BaseDropdown, { DropdownItem } from '@/components/dropdowns/base-dropdown'
import { ArrowDown2, ArrowUp2, Hashtag } from 'iconsax-react'

const sendSlackMessageFormSchema = z.object({
  message: z.string(),
  channel: z.string(),
})

type SendSlackMessageFormData = z.infer<typeof sendSlackMessageFormSchema>

function SlackMessageFormComponent({ data, onSuccess }: { data: SendSlackMessageParams; onSuccess: () => void }) {
  const [loading, setLoading] = useState(true)
  const slackToken = useRef<string>()
  const [items, setItems] = useState<DropdownItem[]>([])
  const [selectedItem, setSelectedItem] = useState<DropdownItem | null>(null)

  useEffect(() => {
    ;(async () => {
      // @ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string
      const token = await getIntegrationTokenForUser(hlToken, 'slack')

      console.log('Slack token', token)

      if (!token) return

      slackToken.current = token

      const channels = await listChannels(token)
      setItems([
        {
          id: 'channel-label',
          type: 'label',
          component: 'Channels',
        },
        ...channels
          .filter((channel: any) => channel.is_channel)
          .map((channel: any) => ({
            id: channel.id,
            type: 'item',
            component: channel.name,
            icon: <Hashtag size={20} />,
          })),
      ])

      setLoading(false)
    })()
  }, [])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SendSlackMessageFormData>({
    resolver: zodResolver(sendSlackMessageFormSchema),
    defaultValues: {
      message: data.message,
    },
  })

  const onSubmit = async (data: SendSlackMessageFormData) => {
    const token = slackToken.current

    if (!token) {
      setError('root', { message: 'Error fetching your Slack token' })
      return
    }

    try {
      await sendMessage(token, data.channel, data.message)
    } catch (e) {
      setError('root', { message: 'Failed to send Slack message' })
      return
    }

    onSuccess()
  }

  const triggerId = useId()

  return (
    <>
      <BaseDropdown
        items={items}
        onItemSelect={(item) => {
          setSelectedItem(item)
        }}
        triggerId={triggerId}
        position="bottom"
        leftClick={true}
      >
        {
          // @ts-ignore
          ({ isOpen }) => (
            <Button id={triggerId} size={'medium'} variant={'tertiary'}>
              <Hashtag size={16} />
              {selectedItem?.component}
              {isOpen && <ArrowDown2 size={16} />}
              {!isOpen && <ArrowUp2 size={16} />}
            </Button>
          )
        }
      </BaseDropdown>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <InputField size={'xxlarge'} label={'Message'} placeholder={'Message'} {...register('message')} />
        <InputField size={'xxlarge'} label={'Channel'} placeholder={'Channel'} {...register('channel')} />

        {errors.root && <p className="text-red-500">{errors.root.message}</p>}
        <Button size={'medium'} variant={'primary'} type={'submit'} disabled={isSubmitting}>
          Send Message
        </Button>
      </form>
    </>
  )
}

export function SendSlackMessageComponent(data: SendSlackMessageParams) {
  const [state, setState] = useState<'form' | 'success'>('form')

  function onSuccess(url?: string) {
    setState('success')
  }

  return (
    <div className="mt-2">
      {state === 'form' && <SlackMessageFormComponent data={data} onSuccess={onSuccess} />}
      {state === 'success' && <span>Slack message sent successfully</span>}
    </div>
  )
}
