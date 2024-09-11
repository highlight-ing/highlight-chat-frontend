'use client'

import Button from '@/components/Button/Button'
import { HighlightIcon } from '@/icons/icons'
import { Prompt } from '@/types/supabase-helpers'
import { ArrowDown, Code, LinkCircle } from 'iconsax-react'

export interface PromptTagPageProps {
  prompts: Prompt[]
}

export default function PromptTagPage({ prompts }: PromptTagPageProps) {
  return (
    <div>
      <div className="flex flex-row items-center border-b border-[#222222] bg-[#191919]/[5%] p-4">
        <div className="flex items-center gap-3">
          <HighlightIcon size={24} color="white" />
          <span className="text-lg font-bold leading-normal text-white">Highlight</span>
        </div>
        <div className="flex-1" />
        <div className="flex gap-3">
          <a
            href="#"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] border border-[#222222] px-4 py-1.5 hover:bg-white/10"
          >
            <div className="flex items-center gap-1 text-center text-[15px] font-medium leading-tight text-[#00e6f5]">
              Copy Link
              <LinkCircle variant="Bold" size="1.25rem" color="#00e6f5" />
            </div>
          </a>
          <a
            href="#"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-[#00dbfb]/20 px-4 py-1.5"
          >
            <div className="flex items-center gap-1 text-[15px] font-medium leading-tight text-[#00e6f5]">
              Download
              <ArrowDown variant="Bold" size="1.25rem" color="#00e6f5" />
            </div>
          </a>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-[100px] bg-[#00f0ff]/20 p-4">
          <div className="inline-flex shrink grow basis-0 items-center justify-center self-stretch">
            <Code size={30} variant="Bold" color="#00e6f5" />
          </div>
        </div>

        <h1 className="text-[32px] font-semibold leading-10 text-white">Software Development Prompts</h1>
        <div className="flex gap-4">
          <a
            href="#"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-white/10 px-4 py-1.5 hover:bg-white/20"
          >
            <div className="text-[15px] font-medium leading-tight text-[#b4b4b4]">Download Highlight</div>
          </a>
          <a
            href="#"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-white/10 px-4 py-1.5 hover:bg-white/20"
          >
            <div className="text-[15px] font-medium leading-tight text-[#b4b4b4]">Join Our Discord</div>
          </a>
        </div>
      </div>
      <div className="fixed bottom-20 left-0 flex w-full items-center justify-center">
        <div className="inline-flex items-center justify-start gap-2.5 rounded-[20px] border border-white/10 px-4 py-3">
          <HighlightIcon size={24} color="white" />
          <div className="flex h-6 shrink grow basis-0 items-center justify-start gap-2">
            <div className="text-base font-medium leading-normal text-[#6e6e6e]">
              Highlight is your personal AI for getting answers and doing work
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-[10px] bg-[#00f0ff] px-4 py-1.5">
            <div className="text-[15px] font-medium leading-tight text-[#0f0f0f]">Get Highlight</div>
          </div>
        </div>
      </div>
    </div>
  )
}
