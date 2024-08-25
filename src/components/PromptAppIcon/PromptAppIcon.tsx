'use client'

import Image from 'next/image'
import { supabaseLoader } from '@/lib/supabase'
import globalStyles from '@/global.module.scss'

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
    <div style={{ width, height, overflow: 'hidden', borderRadius: '50%', flexShrink: 0 }}>
      <Image
        src={`/user_content/${imageId}.${imageExtension}`}
        alt={name ?? 'Prompt app icon'}
        className={className ?? globalStyles.promptIcon}
        width={width}
        height={height}
        loader={supabaseLoader}
      />
    </div>
  )
}
