import React from 'react'

type IntegrationSuccessMessageProps = {
  heading: string
  url: string
  title: string
  subTitle: string
  icon: React.ReactNode
}

export function IntegrationSuccessMessage(props: IntegrationSuccessMessageProps) {
  return (
    <div className="flex flex-col gap-3">
      <p>{props.heading}</p>
      <a href={props.url} target="_blank" style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <div className="flex h-[48px] w-fit items-center gap-2.5 text-nowrap rounded-[16px] border border-light-10 bg-secondary p-[5px] pr-2 text-base leading-none">
          <div className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-light-5 text-primary">
            <div className="size-5 overflow-hidden rounded-md">{props.icon}</div>
          </div>
          <div className="">
            <p className="truncate text-sm font-medium text-secondary">{props.title}</p>
            <p className="text-xs text-tertiary">{props.subTitle}</p>
          </div>
        </div>
      </a>
    </div>
  )
}
