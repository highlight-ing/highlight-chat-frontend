import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { AppShortcutPreferences, PromptWithTags } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'

import { fetchPinnedShortcuts } from '../../_actions/fetchPinnedShortcuts'
import { fetchUserCreatedShortcuts } from '../../_actions/fetchUserCreatedShortcuts'
import { fetchUserShortcutPreferences } from '../../_actions/fetchUserShortcutPreferences'
import { ShortcutEditor } from '../shortcut-editor'
import { ShortcutPreview } from '../shortcut-preview'
import { ShortcutsList } from '../shortcuts-list'
import { ShortcutsNavigation } from '../shortcuts-navigation'

type NavItemType = 'all' | 'unassigned' | 'application' | 'global' | 'app-based'
type NavItem = {
  type: NavItemType
  id: string
}

export function ShortcutsManager() {
  const { getAccessToken } = useAuth()

  const [selectedNavItem, setSelectedNavItem] = useState<NavItem>({
    type: 'all',
    id: 'all',
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

      // Combine and deduplicate shortcuts, marking user-created ones
      const createdSet = new Set((created || []).map((shortcut) => shortcut.id))
      const combined = [...(created || []), ...(pinned || [])]
      const deduplicated = Array.from(
        new Map(combined.map((item) => [item.id, { ...item, isUserCreated: createdSet.has(item.id) }])).values(),
      )

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

    switch (selectedNavItem.type) {
      case 'all':
        console.log('Showing all shortcuts')
        console.groupEnd()
        return shortcuts

      case 'app-based':
        const appBasedShortcuts = shortcuts.filter((shortcut) =>
          preferences?.some((pref) => {
            if (pref.prompt_id !== shortcut.id) return false

            // Check if the shortcut has any app preferences
            const hasAppPreferences =
              (pref.application_name_darwin && pref.application_name_darwin !== '*') ||
              (pref.application_name_win32 && pref.application_name_win32 !== '*')

            return hasAppPreferences
          }),
        )
        console.log('Filtered app-based shortcuts:', appBasedShortcuts)
        console.groupEnd()
        return appBasedShortcuts

      case 'global':
        const globalShortcuts = shortcuts.filter(
          (shortcut) =>
            !shortcut.external_id ||
            preferences?.some(
              (pref) =>
                pref.prompt_id === shortcut.id &&
                (pref.application_name_darwin === '*' || pref.application_name_win32 === '*'),
            ),
        )
        console.log('Filtered global shortcuts:', globalShortcuts)
        console.groupEnd()
        return globalShortcuts

      case 'unassigned':
        const unassignedShortcuts = shortcuts.filter(
          (shortcut) => !preferences?.some((pref) => pref.prompt_id === shortcut.id),
        )
        console.log('Filtered unassigned shortcuts:', unassignedShortcuts)
        console.groupEnd()
        return unassignedShortcuts

      case 'application':
        if (!preferences) {
          console.log('No preferences available for application filtering')
          console.groupEnd()
          return []
        }
        const appName = selectedNavItem.id
        console.log('Filtering for application:', appName)

        const appShortcuts = shortcuts.filter((shortcut) =>
          preferences.some((pref: AppShortcutPreferences) => {
            if (pref.prompt_id !== shortcut.id) return false

            let darwinApps: string[] = []
            if (pref.application_name_darwin) {
              try {
                darwinApps = JSON.parse(pref.application_name_darwin)
              } catch (e) {
                console.error('Error parsing darwin apps:', e)
              }
            }

            let win32Apps: string[] = []
            if (pref.application_name_win32) {
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

        console.log('Filtered application shortcuts:', appShortcuts)
        console.groupEnd()
        return appShortcuts

      default:
        console.log('No filtering applied, returning all shortcuts')
        console.groupEnd()
        return shortcuts
    }
  }, [shortcuts, preferences, selectedNavItem])

  const handleNavChange = (navItem: NavItem) => {
    console.log('Navigation changed:', navItem)
    setSelectedNavItem(navItem)

    // Get the filtered shortcuts for the new navigation item
    const newFilteredShortcuts = getFilteredShortcuts(shortcuts || [], preferences, navItem)

    // Set the first shortcut as selected if available
    if (newFilteredShortcuts.length > 0) {
      setSelectedShortcut(newFilteredShortcuts[0].id.toString())
    } else {
      setSelectedShortcut(undefined)
    }
  }
  const getFilteredShortcuts = (
    shortcuts: (PromptWithTags & { isUserCreated?: boolean })[],
    preferences: AppShortcutPreferences[] | undefined,
    navItem: NavItem,
  ) => {
    switch (navItem.type) {
      case 'all':
        return shortcuts
      case 'global':
        return shortcuts.filter(
          (shortcut) =>
            !shortcut.external_id ||
            preferences?.some(
              (pref) =>
                pref.prompt_id === shortcut.id &&
                (pref.application_name_darwin === '*' || pref.application_name_win32 === '*'),
            ),
        )
      case 'unassigned':
        return shortcuts.filter((shortcut) => !preferences?.some((pref) => pref.prompt_id === shortcut.id))
      case 'application':
        if (!preferences) return []
        const appName = navItem.id
        return shortcuts.filter((shortcut) =>
          preferences.some((pref) => {
            if (pref.prompt_id !== shortcut.id) return false

            let darwinApps: string[] = []
            if (pref.application_name_darwin && pref.application_name_darwin !== '*') {
              try {
                darwinApps = JSON.parse(pref.application_name_darwin)
              } catch (e) {
                console.error('Error parsing darwin apps:', e)
              }
            }

            let win32Apps: string[] = []
            if (pref.application_name_win32 && pref.application_name_win32 !== '*') {
              try {
                win32Apps = JSON.parse(pref.application_name_win32)
              } catch (e) {
                console.error('Error parsing win32 apps:', e)
              }
            }

            return darwinApps.includes(appName) || win32Apps.includes(appName)
          }),
        )
      default:
        return shortcuts
    }
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
      <div className="w-[244px] flex-shrink-0 border-r border-[#ffffff0d]">
        <ShortcutsNavigation
          selectedNavItem={selectedNavItem}
          onSelectNavItem={handleNavChange}
          shortcuts={shortcuts || []}
          preferences={preferences}
        />
      </div>
      <div className="w-[400px] flex-shrink-0 border-r border-[#ffffff0d]">
        <ShortcutsList
          shortcuts={filteredShortcuts}
          isLoading={isLoading}
          selectedNavItem={selectedNavItem}
          onSelectShortcut={setSelectedShortcut}
          selectedShortcutId={selectedShortcut}
        />
      </div>
      <div className="flex-1 border-r border-[#ffffff0d]">
        <ShortcutPreview
          shortcutId={selectedShortcut}
          shortcuts={shortcuts}
          preferences={preferences}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
