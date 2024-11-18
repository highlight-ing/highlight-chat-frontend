'use client'

import { useState } from 'react'
import { ArrowDown, Code, LinkCircle, Tag } from 'iconsax-react'

import { Prompt } from '@/types/supabase-helpers'
import { useDownloadOrRedirect } from '@/hooks/useDownloadOrRedirect'
import Button from '@/components/Button/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu/dropdown-menu'
import { HighlightIcon } from '@/components/icons'
import { PromptWithTags } from '@/app/(web)/tag/[slug]/page'

function MiddleDownloadButton() {
  const { platform, handleDownload } = useDownloadOrRedirect()

  if (platform === 'windows') {
    return (
      <a
        href="#"
        className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-white/10 px-4 py-1.5 hover:bg-white/20"
        onClick={() => handleDownload()}
      >
        <div className="text-[15px] font-medium leading-tight text-[#b4b4b4]">Download Highlight</div>
      </a>
    )
  } else if (platform === 'mac') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <a
            href="#"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-white/10 px-4 py-1.5 hover:bg-white/20"
          >
            <div className="text-[15px] font-medium leading-tight text-[#b4b4b4]">Download Highlight</div>
          </a>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border border-light-10 bg-secondary">
          <DropdownMenuItem
            onClick={() => handleDownload('intel')}
            className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
          >
            Download for Intel Mac
          </DropdownMenuItem>
          <div className="mx-2 my-1 border-t border-light-10"></div>
          <DropdownMenuItem
            onClick={() => handleDownload('silicon')}
            className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
          >
            Download for Silicon Mac
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}

function TopDownloadButton() {
  const { platform, handleDownload } = useDownloadOrRedirect()

  if (platform === 'windows') {
    return (
      <a
        href="#"
        className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-[#00dbfb]/20 px-4 py-1.5"
        onClick={() => handleDownload()}
      >
        <div className="flex items-center gap-1 text-[15px] font-medium leading-tight text-[#00e6f5]">
          Download
          <ArrowDown variant="Bold" size="1.25rem" color="#00e6f5" />
        </div>
      </a>
    )
  } else if (platform === 'mac') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <a
            href="#"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-[#00dbfb]/20 px-4 py-1.5"
          >
            <div className="flex items-center gap-1 text-[15px] font-medium leading-tight text-[#00e6f5]">
              Download
              <ArrowDown variant="Bold" size="1.25rem" color="#00e6f5" />
            </div>
          </a>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border border-light-10 bg-secondary">
          <DropdownMenuItem
            onClick={() => handleDownload('intel')}
            className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
          >
            Download for Intel Mac
          </DropdownMenuItem>
          <div className="mx-2 my-1 border-t border-light-10"></div>
          <DropdownMenuItem
            onClick={() => handleDownload('silicon')}
            className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
          >
            Download for Silicon Mac
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}

function BottomDownloadButton() {
  const { platform, handleDownload } = useDownloadOrRedirect()

  if (platform === 'windows') {
    return (
      <a
        onClick={() => handleDownload()}
        className="flex items-center justify-center gap-2 rounded-[10px] bg-[#00f0ff] px-4 py-1.5"
      >
        <div className="text-[15px] font-medium leading-tight text-[#0f0f0f]">Get Highlight</div>
      </a>
    )
  } else if (platform === 'mac') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <a href="#" className="flex items-center justify-center gap-2 rounded-[10px] bg-[#00f0ff] px-4 py-1.5">
            <div className="text-[15px] font-medium leading-tight text-[#0f0f0f]">Get Highlight</div>
          </a>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border border-light-10 bg-secondary">
          <DropdownMenuItem
            onClick={() => handleDownload('intel')}
            className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
          >
            Download for Intel Mac
          </DropdownMenuItem>
          <div className="mx-2 my-1 border-t border-light-10"></div>
          <DropdownMenuItem
            onClick={() => handleDownload('silicon')}
            className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
          >
            Download for Silicon Mac
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}

function PromptListItem({ prompt }: { prompt: PromptWithTags }) {
  const [isCopied, setIsCopied] = useState(false)

  function onGet() {
    window.location.href = `highlight://prompt/${prompt.slug}`
  }

  function onShare() {
    // Copy the prompt link to the clipboard
    navigator.clipboard.writeText(`https://chat.highlight.ing/prompts/${prompt.slug}`)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <a href={`/prompts/${prompt.slug}`} className="flex flex-col gap-3 bg-[#191919] p-5 hover:bg-[#191919]/[80%]">
      <div className="flex justify-between">
        <div className="text-base font-medium leading-normal text-[#eeeeee]">{prompt.name ?? ''}</div>

        <div className="flex-1"></div>

        <div className="flex gap-2">
          <Button size="xsmall" variant="tertiary" onClick={onShare}>
            {isCopied ? 'Copied!' : 'Share'}
          </Button>
          <Button size="xsmall" variant="primary" onClick={onGet}>
            Get
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start gap-3 self-stretch">
        <div className="self-stretch text-[15px] leading-normal text-[#b4b4b4]">{prompt.description}</div>
      </div>
      <div className="inline-flex items-start justify-start gap-1">
        <div className="flex items-center justify-center gap-1 rounded-md border border-[#222222] px-2 py-0.5">
          <div className="text-[13px] font-medium leading-tight text-[#3a3a3a]">{prompt.public_use_number} Uses</div>
        </div>
        {prompt.added_prompt_tags?.map((tag) => (
          <div className="flex items-center justify-center gap-1 rounded-md border border-[#222222] px-2 py-0.5">
            <div className="text-[13px] font-medium leading-tight text-[#3a3a3a]">{tag.tags?.tag}</div>
          </div>
        ))}
      </div>
    </a>
  )
}

export interface PromptTagPageProps {
  tag: string
  prompts: PromptWithTags[]
}

function CopyLinkButton({ tag }: { tag: string }) {
  const [isCopied, setIsCopied] = useState(false)

  function onCopy() {
    navigator.clipboard.writeText(`https://chat.highlight.ing/tag/${tag}`)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <a
      href="#"
      className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] border border-[#222222] px-4 py-1.5 hover:bg-white/10"
      onClick={onCopy}
    >
      <div className="flex items-center gap-1 text-center text-[15px] font-medium leading-tight text-[#00e6f5]">
        {isCopied ? 'Copied!' : 'Copy Link'}
        <LinkCircle variant="Bold" size="1.25rem" color="#00e6f5" />
      </div>
    </a>
  )
}

export default function PromptTagPage({ tag, prompts }: PromptTagPageProps) {
  return (
    <div>
      <div className="flex flex-row items-center border-b border-[#222222] bg-[#191919]/[5%] p-4">
        <div className="flex items-center gap-3">
          <HighlightIcon size={24} color="white" />
          <span className="text-lg font-bold leading-normal text-white">Highlight</span>
        </div>
        <div className="flex-1" />
        <div className="flex gap-3">
          <CopyLinkButton tag={tag} />
          <TopDownloadButton />
        </div>
      </div>
      <div className="mb-40 mt-10 flex flex-col items-center gap-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-[100px] bg-[#00f0ff]/20 p-4">
          <div className="inline-flex shrink grow basis-0 items-center justify-center self-stretch">
            <Tag size={30} variant="Bold" color="#00e6f5" />
          </div>
        </div>

        <h1 className="text-[32px] font-semibold leading-10 text-white">{tag}</h1>
        <div className="flex gap-4">
          <MiddleDownloadButton />
          <a
            target="_blank"
            href="https://discord.gg/hlai"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-white/10 px-4 py-1.5 hover:bg-white/20"
          >
            <div className="text-[15px] font-medium leading-tight text-[#b4b4b4]">Join Our Discord</div>
          </a>
        </div>
        <div className="w-[44.5rem] overflow-clip rounded-bl-[20px] rounded-br-[20px] rounded-tl-[20px] rounded-tr-[20px]">
          {prompts.map((prompt) => (
            <PromptListItem key={prompt.external_id} prompt={prompt} />
          ))}
        </div>
      </div>
      <div className="fixed bottom-20 left-0 flex w-full items-center justify-center">
        <div className="inline-flex items-center justify-start gap-2.5 rounded-[20px] border border-white/10 bg-[#191919] px-4 py-3">
          <HighlightIcon size={24} color="white" />
          <div className="flex h-6 shrink grow basis-0 items-center justify-start gap-2">
            <div className="text-base font-medium leading-normal text-[#6e6e6e]">
              Highlight is your personal AI for getting answers and doing work
            </div>
          </div>
          <BottomDownloadButton />
        </div>
      </div>
    </div>
  )
}
