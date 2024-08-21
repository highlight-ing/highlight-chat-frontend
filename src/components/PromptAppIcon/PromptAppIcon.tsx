'use client'

import Image from 'next/image'
import { supabaseLoader } from '@/lib/supabase'

export default function PromptAppIcon({
  height = 64,
  width = 64,
  imageId,
  imageExtension,
  className,
  name,
}: {
  height?: number
  width?: number
  imageId: string
  imageExtension: string
  className?: string
  name?: string
}) {
  return (
    <Image
      src={`/user_content/${imageId}.${imageExtension}`}
      alt={name ?? 'Prompt app icon'}
      className={className}
      width={width}
      height={height}
      loader={supabaseLoader}
    />
  )
}
