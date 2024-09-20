import React from 'react'

interface SectionHeaderProps {
  title: string
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return <h2 className="mb-4 text-[16px] font-medium text-subtle">{title}</h2>
}
