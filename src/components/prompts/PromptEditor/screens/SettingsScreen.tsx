'use client'

import Button from '@/components/Button/Button'
import InputField from '@/components/TextInput/InputField'
import styles from '../prompteditor.module.scss'
import { PropsWithChildren, ReactElement, useEffect, useRef, useState } from 'react'
import TextArea from '@/components/TextInput/TextArea'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { Switch } from '@/components/catalyst/switch'
import Image from 'next/image'
import { supabaseLoader } from '@/lib/supabase'
import { deletePrompt } from '@/utils/prompts'
import useAuth from '@/hooks/useAuth'
import { usePromptsStore } from '@/stores/prompts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { videoUrlSchema } from '@/lib/zod'

function AppIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#712FFF" fillOpacity="0.2" />
      <path
        d="M37.587 18.668H26.4137C21.5603 18.668 18.667 21.5613 18.667 26.4146V37.5746C18.667 42.4413 21.5603 45.3346 26.4137 45.3346H37.5737C42.427 45.3346 45.3203 42.4413 45.3203 37.588V26.4146C45.3337 21.5613 42.4403 18.668 37.587 18.668ZM27.3337 24.508C28.707 24.508 29.8403 25.628 29.8403 27.0146C29.8403 28.4013 28.7203 29.5213 27.3337 29.5213C25.947 29.5213 24.827 28.3746 24.827 27.0013C24.827 25.628 25.9603 24.508 27.3337 24.508ZM32.0003 41.4413C28.4137 41.4413 25.4937 38.5213 25.4937 34.9346C25.4937 34.0013 26.2537 33.228 27.187 33.228H36.787C37.7203 33.228 38.4803 33.988 38.4803 34.9346C38.507 38.5213 35.587 41.4413 32.0003 41.4413ZM36.667 29.4946C35.2937 29.4946 34.1603 28.3746 34.1603 26.988C34.1603 25.6013 35.2803 24.4813 36.667 24.4813C38.0537 24.4813 39.1737 25.6013 39.1737 26.988C39.1737 28.3746 38.0403 29.4946 36.667 29.4946Z"
        fill="#712FFF"
      />
    </svg>
  )
}

function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tempImageSrc, setTempImageSrc] = useState<string | undefined>()
  const { promptEditorData, setPromptEditorData } = usePromptEditorStore()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]

      if (file) {
        setPromptEditorData({ uploadingImage: file })

        const reader = new FileReader()
        reader.onload = (e) => {
          setTempImageSrc(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  let image

  if (tempImageSrc) {
    image = <Image src={tempImageSrc} alt="Prompt image" className="h-16 w-16 rounded-full" width={64} height={64} />
  } else if (promptEditorData.image) {
    image = (
      <Image
        src={`/user_content/${promptEditorData.image}`}
        alt="Prompt image"
        className="h-16 w-16 rounded-full"
        width={64}
        height={64}
        loader={supabaseLoader}
      />
    )
  } else {
    image = <AppIcon />
  }

  return (
    <>
      {image}
      <Button size="medium" variant="tertiary" onClick={() => fileInputRef.current?.click()}>
        Upload Image
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        name="photo"
        className="hidden"
        onChange={handleFileChange}
        // disabled={pending}
      />
    </>
  )
}

function ShareLinkButton() {
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const { promptEditorData } = usePromptEditorStore()

  const slug = promptEditorData.slug

  const host = window.location.protocol + '//' + window.location.host
  const url = `${host}/prompts/${slug}`

  const [copied, setCopied] = useState(false)

  function onCopyLinkClick() {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    navigator.clipboard.writeText(url)
    setCopied(true)

    timeout.current = setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  return (
    <SettingOption
      label={'Share Link'}
      description={<span className={'text-sm'}>{slug ? url : 'Save your prompt to generate a share link'}</span>}
    >
      <Button
        onClick={onCopyLinkClick}
        size={'medium'}
        variant={'tertiary'}
        style={{ marginRight: '6px' }}
        disabled={!slug || copied}
      >
        {copied ? 'Copied' : 'Copy Link'}
      </Button>
    </SettingOption>
  )
}

function DeletePromptButton({ onDelete }: { onDelete?: () => void }) {
  const { removePrompt } = usePromptsStore()
  const { promptEditorData } = usePromptEditorStore()
  const { getAccessToken } = useAuth()

  const isNewPrompt = !promptEditorData.externalId

  async function _onDelete() {
    if (!promptEditorData.externalId) {
      return
    }

    const authToken = await getAccessToken()
    const res = await deletePrompt(promptEditorData.externalId, authToken)

    if (res && res.error) {
      console.error('Error while calling deletePrompt', res.error)
      return
    }

    removePrompt(promptEditorData.externalId)
    onDelete?.()
  }

  return (
    <SettingOption label={'Delete Prompt'} description={<></>}>
      <Button
        onClick={_onDelete}
        size={'medium'}
        variant={'danger'}
        style={{ marginRight: '6px' }}
        disabled={isNewPrompt}
      >
        Delete Prompt
      </Button>
    </SettingOption>
  )
}

const SettingsSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(40, { message: 'Name must be less than 40 characters' }),
  videoUrl: videoUrlSchema,
  description: z.string().min(1, { message: 'Description is required' }),
})

export default function SettingsScreen({ onClose }: { onClose?: () => void }) {
  const { promptEditorData, setPromptEditorData, setSettingsHasNoErrors } = usePromptEditorStore()

  const { register, watch, formState, trigger } = useForm({
    defaultValues: {
      name: promptEditorData.name,
      videoUrl: promptEditorData.videoUrl,
      description: promptEditorData.description,
    },
    resolver: zodResolver(SettingsSchema),
    mode: 'all',
  })

  const errors = formState.errors

  useEffect(() => {
    // Trigger validation on initial mount
    trigger()
  }, [])

  useEffect(() => {
    setSettingsHasNoErrors(Object.keys(errors).length === 0)
  }, [formState])

  // Hook to update the prompt editor data when the form changes
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name) {
        return
      }
      console.log('setting prompt editor data', { [name]: value.name })

      setPromptEditorData({ [name]: value.name })
    })
    return () => subscription.unsubscribe()
  }, [watch])

  function onDelete() {
    onClose?.()
  }

  return (
    <div className={styles.settingsPage}>
      <div className={'flex flex-1 flex-col gap-8'}>
        <div className="flex items-center space-x-6">
          <ImageUpload />
        </div>
        <div className="flex flex-col gap-6">
          <InputField
            size={'xxlarge'}
            label={'Name'}
            placeholder={'Name your app'}
            {...register('name')}
            error={errors.name?.message}
          />

          <InputField
            size={'xxlarge'}
            label={'Video Link'}
            placeholder={'Provide a video demo for your app (optional)'}
            {...register('videoUrl')}
            error={errors.videoUrl?.message}
          />
          <TextArea
            size={'xxlarge'}
            label={'Description'}
            placeholder={'Describe what your app does...'}
            rows={3}
            {...register('description')}
            error={errors.description?.message}
          />
        </div>
      </div>
      <div className={'flex flex-1 flex-col gap-4'}>
        <VisibilityToggle
          visibility={promptEditorData.visibility}
          onToggle={(visibility) => setPromptEditorData({ visibility })}
        />
        <ShareLinkButton />
        <DeletePromptButton onDelete={onDelete} />
      </div>
    </div>
  )
}

//{visibility: 'public' | 'private', onToggle: (visibility: 'public' | 'private') => void}
const SettingOption = ({
  children,
  label,
  description,
}: PropsWithChildren<{ label: string | ReactElement; description: string | ReactElement }>) => {
  return (
    <div className={styles.settingOption}>
      <div className={'flex flex-col gap-1'}>
        <h1 className={'text-light-100'}>{label}</h1>
        <span className={'text-light-60'}>{description}</span>
      </div>
      {children}
    </div>
  )
}

const VisibilityToggle = ({
  visibility,
  onToggle,
}: {
  visibility: 'public' | 'private'
  onToggle: (visibility: 'public' | 'private') => void
}) => {
  return (
    <SettingOption label={'Visibility'} description={'Share your app with the community'}>
      <div className="flex items-center gap-2">
        <p className="text-xs opacity-40">{visibility === 'public' ? 'Public' : 'Private'}</p>
        <Switch checked={visibility === 'public'} onChange={(checked) => onToggle(checked ? 'public' : 'private')} />
      </div>
    </SettingOption>
  )
}
