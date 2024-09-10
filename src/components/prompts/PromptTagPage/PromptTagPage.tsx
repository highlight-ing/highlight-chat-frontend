'use client'

import TrendingPrompts from '@/components/TrendingPrompts/TrendingPrompts'
import { Prompt } from '@/types/supabase-helpers'

export interface PromptTagPageProps {
  prompts: Prompt[]
}

export default function PromptTagPage({ prompts }: PromptTagPageProps) {
  return (
    <div>
      <div className="flex flex-row items-center">
        <div>
          <span>Highlight</span>
        </div>
        <div className="flex-1" />
        <div>
          <span>Copy Link</span>
          <span>Download</span>
        </div>
      </div>
    </div>
  )
}
