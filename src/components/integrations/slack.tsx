import { SendSlackMessageParams } from '@/hooks/useIntegrations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InputField from '../TextInput/InputField'
import Button from '../Button/Button'
import { sendMessage } from '@/utils/slack-server-actions'
import { getIntegrationTokenForUser } from '@/utils/integrations-server-actions'
import useAuth from '@/hooks/useAuth'

const sendSlackMessageFormSchema = z.object({
  message: z.string(),
  channel: z.string(),
})

type SendSlackMessageFormData = z.infer<typeof sendSlackMessageFormSchema>

function SlackMessageFormComponent({ data, onSuccess }: { data: SendSlackMessageParams; onSuccess: () => void }) {
  const { getAccessToken } = useAuth()

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
    const hlToken = await getAccessToken()
    const token = await getIntegrationTokenForUser(hlToken, 'slack')

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

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <InputField size={'xxlarge'} label={'Message'} placeholder={'Message'} {...register('message')} />
      <InputField size={'xxlarge'} label={'Channel'} placeholder={'Channel'} {...register('channel')} />
      <Button size={'medium'} variant={'primary'} type={'submit'} disabled={isSubmitting}>
        Send Message
      </Button>
    </form>
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
