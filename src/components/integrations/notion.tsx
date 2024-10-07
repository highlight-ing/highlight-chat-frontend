import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InputField from '../TextInput/InputField'
import TextArea from '../TextInput/TextArea'
import Button from '../Button/Button'

interface CreateNotionPageComponentProps {
  title: string
  description?: string
  content: string
}

const notionPageFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  content: z.string(),
})

type NotionPageFormData = z.infer<typeof notionPageFormSchema>

export function CreateNotionPageComponent({ title, description, content }: CreateNotionPageComponentProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NotionPageFormData>({
    resolver: zodResolver(notionPageFormSchema),
    defaultValues: {
      title,
      description,
      content,
    },
  })

  async function onSubmit(data: NotionPageFormData) {
    console.log(data)
  }

  return (
    <div className="mt-2">
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <InputField size={'xxlarge'} label={'Title'} placeholder={'Issue Title'} {...register('title')} />
        <InputField
          size={'xxlarge'}
          label={'Description'}
          placeholder={'Issue Description'}
          {...register('description')}
        />
        <TextArea
          rows={5}
          size={'xxlarge'}
          label={'Markdown Content'}
          placeholder={'Page Content'}
          {...register('content')}
        />
        <Button size={'medium'} variant={'primary'} type={'submit'}>
          Create Page
        </Button>
      </form>
    </div>
  )
}
