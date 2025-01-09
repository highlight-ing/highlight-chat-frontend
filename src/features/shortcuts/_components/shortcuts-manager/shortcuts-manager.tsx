import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { AppShortcutPreferences } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'

import { fetchPinnedShortcuts } from '../../_actions/fetchPinnedShortcuts'
import { fetchUserCreatedShortcuts } from '../../_actions/fetchUserCreatedShortcuts'
import { fetchUserShortcutPreferences } from '../../_actions/fetchUserShortcutPreferences'
import { ShortcutEditor } from '../shortcut-editor'
import { ShortcutsList } from '../shortcuts-list'
import { ShortcutsNavigation } from '../shortcuts-navigation'

export function ShortcutsManager() {
  const { getAccessToken } = useAuth()

  const [selectedNavItem, setSelectedNavItem] = useState<
    | {
        type: 'application' | 'tag' | 'global'
        id: string
      }
    | undefined
  >({
    type: 'global',
    id: 'global',
  })

  const [selectedShortcut, setSelectedShortcut] = useState<string | undefined>()

  // Fetch shortcuts
  const { data: shortcuts, isLoading: isLoadingShortcuts } = useQuery({
    queryKey: ['shortcuts'],
    queryFn: async () => {
      console.group('Fetching Shortcuts')
      const authToken = await getAccessToken()
      const [created, pinned] = await Promise.all([
        fetchUserCreatedShortcuts(authToken),
        fetchPinnedShortcuts(authToken),
      ])

      console.log('Created shortcuts:', created)
      console.log('Pinned shortcuts:', pinned)

      if ('error' in created || 'error' in pinned) {
        console.error('Error fetching shortcuts:', { created, pinned })
        console.groupEnd()
        throw new Error('Failed to fetch shortcuts')
      }

      // Combine and deduplicate shortcuts
      const combined = [...(created || []), ...(pinned || [])]
      const deduplicated = Array.from(new Map(combined.map((item) => [item.id, item])).values())

      console.log('Combined and deduplicated shortcuts:', deduplicated)
      console.groupEnd()
      return deduplicated
    },
  })

  // Fetch user preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ['user-shortcut-preferences'],
    queryFn: async () => {
      console.group('Fetching Preferences')
      const authToken = await getAccessToken()
      const result = await fetchUserShortcutPreferences(authToken)

      console.log('Raw preferences result:', result)

      if (result.error) {
        console.error('Error fetching preferences:', result.error)
        console.groupEnd()
        throw new Error(result.error)
      }

      console.log('Processed preferences:', result.preferences)
      console.groupEnd()
      return result.preferences || []
    },
  })

  // Filter shortcuts based on selected nav item and preferences
  const filteredShortcuts = React.useMemo(() => {
    console.group('Filtering Shortcuts')
    console.log('Current shortcuts:', shortcuts)
    console.log('Current preferences:', preferences)
    console.log('Selected nav item:', selectedNavItem)

    if (!shortcuts) {
      console.log('No shortcuts available')
      console.groupEnd()
      return []
    }

    if (!selectedNavItem) {
      console.log('No nav item selected, returning all shortcuts')
      console.groupEnd()
      return shortcuts
    }

    if (selectedNavItem.type === 'global') {
      // Show shortcuts that either have no external_id or have preferences marked as global ('*')
      const filtered = shortcuts.filter(
        (shortcut) =>
          !shortcut.external_id ||
          preferences?.some(
            (pref) =>
              pref.prompt_id === shortcut.id &&
              (pref.application_name_darwin === '*' || pref.application_name_win32 === '*'),
          ),
      )
      console.log('Filtered global shortcuts:', filtered)
      console.groupEnd()
      return filtered
    }

    if (selectedNavItem.type === 'application' && preferences) {
      const appName = selectedNavItem.id
      console.log('Filtering for application:', appName)

      const filtered = shortcuts.filter((shortcut) =>
        preferences.some((pref: AppShortcutPreferences) => {
          // Check if the preference is for this shortcut
          if (pref.prompt_id !== shortcut.id) return false

          // Handle darwin (Mac) applications
          let darwinApps: string[] = []
          if (pref.application_name_darwin === '*') {
            darwinApps = ['*']
          } else if (pref.application_name_darwin) {
            try {
              darwinApps = JSON.parse(pref.application_name_darwin)
            } catch (e) {
              console.error('Error parsing darwin apps:', e)
            }
          }

          // Handle win32 (Windows) applications
          let win32Apps: string[] = []
          if (pref.application_name_win32 === '*') {
            win32Apps = ['*']
          } else if (pref.application_name_win32) {
            try {
              win32Apps = JSON.parse(pref.application_name_win32)
            } catch (e) {
              console.error('Error parsing win32 apps:', e)
            }
          }

          const matches = darwinApps.includes(appName) || win32Apps.includes(appName)

          console.log('Checking shortcut:', {
            shortcutId: shortcut.id,
            shortcutName: shortcut.name,
            prefPromptId: pref.prompt_id,
            darwinApps,
            win32Apps,
            appName,
            matches,
          })

          return matches
        }),
      )

      console.log('Filtered application shortcuts:', filtered)
      console.groupEnd()
      return filtered
    }

    console.log('No filtering applied, returning all shortcuts')
    console.groupEnd()
    return shortcuts
  }, [shortcuts, preferences, selectedNavItem])

  // Reset selected shortcut when navigation changes
  const handleNavChange = (navItem: { type: 'application' | 'tag' | 'global'; id: string }) => {
    console.log('Navigation changed:', navItem)
    setSelectedShortcut(undefined)
    setSelectedNavItem(navItem)
  }

  const isLoading = isLoadingShortcuts || isLoadingPreferences

  // Log render state
  React.useEffect(() => {
    console.group('ShortcutsManager State')
    console.log('Loading state:', { shortcuts: isLoadingShortcuts, preferences: isLoadingPreferences })
    console.log('Current shortcuts:', shortcuts)
    console.log('Current preferences:', preferences)
    console.log('Selected nav item:', selectedNavItem)
    console.log('Filtered shortcuts:', filteredShortcuts)
    console.groupEnd()
  }, [shortcuts, preferences, selectedNavItem, filteredShortcuts, isLoadingShortcuts, isLoadingPreferences])

  return (
    <div className="flex w-full h-[calc(100vh-48px)] mt-[48px]">
      <div className="w-96 border-r border-[#ffffff0d]">
        <ShortcutsNavigation selectedNavItem={selectedNavItem} onSelectNavItem={handleNavChange} />
      </div>
      <div className="w-full border-r border-[#ffffff0d]">
        <ShortcutsList
          shortcuts={filteredShortcuts}
          isLoading={isLoading}
          selectedNavItem={selectedNavItem}
          onSelectShortcut={setSelectedShortcut}
        />
      </div>
    </div>
  )
}
