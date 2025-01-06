import React, { useEffect, useState } from 'react'

import {
  ChromeIcon,
  CursorIcon,
  DiscordIcon,
  FigmaIcon,
  IconPropTypes,
  NotionIcon,
  SafariIcon,
  SlackIcon,
  VSCodeIcon,
} from '@/components/icons'

export type Application = {
  displayName: string
  id: string
  icon?: React.ComponentType<IconPropTypes>
  theme: 'dark' | 'light'
  description: string
}

const MOCK_APPLICATIONS: Application[] = [
  { displayName: 'Slack', id: 'Slack', icon: SlackIcon, theme: 'dark', description: 'Manage Slack shortcuts' },
  { displayName: 'Cursor', id: 'Cursor', icon: CursorIcon, theme: 'dark', description: 'Manage Cursor shortcuts' },
  { displayName: 'VS Code', id: 'VS Code', icon: VSCodeIcon, theme: 'dark', description: 'Manage VS Code shortcuts' },
  {
    displayName: 'Chrome',
    id: 'Google Chrome',
    icon: ChromeIcon,
    theme: 'dark',
    description: 'Manage Chrome shortcuts',
  },
  { displayName: 'Notion', id: 'Notion', icon: NotionIcon, theme: 'dark', description: 'Manage Notion shortcuts' },
  { displayName: 'Safari', id: 'Safari', icon: SafariIcon, theme: 'dark', description: 'Manage Safari shortcuts' },
  { displayName: 'Discord', id: 'Discord', icon: DiscordIcon, theme: 'dark', description: 'Manage Discord shortcuts' },
  { displayName: 'Figma', id: 'Figma', icon: FigmaIcon, theme: 'dark', description: 'Manage Figma shortcuts' },
]

export function useApplications() {
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState(MOCK_APPLICATIONS)

  useEffect(() => {
    const loadApplications = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
    }

    loadApplications()
  }, [])

  return {
    isLoading,
    applications,
  }
}
