import Image from 'next/image'
import { supabaseLoader } from '@/lib/supabase'

export default function PromptAppIcon({
  height = 64,
  width = 64,
  imageId,
  imageExtension,
  className,
}: {
  height?: number
  width?: number
  imageId: string
  imageExtension: string
  className?: string
}) {
  return (
    <Image
      src={`/user_content/${imageId}.${imageExtension}`}
      alt="Prompt app icon"
      className={className}
      width={width}
      height={height}
      loader={supabaseLoader}
    />
  )
}
