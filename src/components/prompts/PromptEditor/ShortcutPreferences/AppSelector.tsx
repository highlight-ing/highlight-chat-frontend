import { useEffect, useMemo, useRef, useState } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import sassVariables from '@/variables.module.scss'
import { ArrowDown2, Category2, CloseCircle, Global, HashtagSquare } from 'iconsax-react'

import { getInstalledApplications } from '@/utils/highlightService'
import { Button } from '@/components/ui/button'
import ContextMenu, { MenuItemType } from '@/components/ContextMenu/ContextMenu'
import { ChromeIcon, CursorIcon, DiscordIcon, NotionIcon, SafariIcon, SlackIcon, VSCodeIcon } from '@/components/icons'
import Tooltip from '@/components/Tooltip/Tooltip'

type AppAvailability = 'all' | 'specific' | 'hidden'

type MenuOption = {
  value: AppAvailability
  icon: React.ReactNode
  text: string
  color: string
}

type AppOption = {
  displayName: string
  id: string
  icon?: React.ReactNode
  theme?: 'light' | 'dark'
}

const menuOptions: MenuOption[] = [
  {
    value: 'all',
    icon: <Global variant="Bold" size={20} color={sassVariables.green100} />,
    text: 'All Apps',
    color: sassVariables.green100,
  },
  {
    value: 'specific',
    icon: <Category2 variant="Bold" size={20} color={sassVariables.green100} />,
    text: 'Specify Apps',
    color: sassVariables.green100,
  },
  {
    value: 'hidden',
    icon: <CloseCircle variant="Bold" size={20} color={sassVariables.red100} />,
    text: 'Hidden',
    color: sassVariables.red100,
  },
]

const DEFAULT_APP_OPTIONS: AppOption[] = [
  { displayName: 'Slack', id: 'Slack', icon: <SlackIcon />, theme: 'dark' },
  { displayName: 'Cursor', id: 'Cursor', icon: <CursorIcon />, theme: 'dark' },
  { displayName: 'VS Code', id: 'VS Code', icon: <VSCodeIcon />, theme: 'dark' },
  { displayName: 'Chrome', id: 'Google Chrome', icon: <ChromeIcon />, theme: 'dark' },
  { displayName: 'Notion', id: 'Notion', icon: <NotionIcon />, theme: 'dark' },
  { displayName: 'Safari', id: 'Safari', icon: <SafariIcon />, theme: 'dark' },
  // { displayName: "Terminal", icon: <VSCodeIcon />, theme: 'dark'  },
  // { displayName: "Finder", icon: <NotionIcon />, theme: 'dark' },
  { displayName: 'Discord', id: 'Discord', icon: <DiscordIcon />, theme: 'dark' },
  // { displayName: "Firefox", icon: <ChromeIcon />, theme: 'dark' },
]

export default function AppSelector({ shortcutName }: { shortcutName: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [installedApplications, setInstalledApplications] = useState<string[]>([])
  const [availableApplications, setAvailableApplications] = useState<AppOption[]>([])
  const [appOptions, setAppOptions] = useState<AppOption[]>(DEFAULT_APP_OPTIONS)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hasInitializedApps = useRef(false)

  const { shortcutAvailability, setShortcutAvailability, appVisibility, setAppVisibility } = usePromptEditorStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleAppVisibility = (appName: string) => {
    setAppVisibility({
      ...appVisibility,
      [appName]: !appVisibility[appName],
    })
  }

  useEffect(() => {
    const loadApps = async () => {
      const installedApps = await getInstalledApplications()
      setInstalledApplications(installedApps.applications)
    }

    loadApps()
  }, [])

  const contextMenuItems = useMemo(() => {
    const items: MenuItemType[] = menuOptions.map((option) => ({
      label: (
        <>
          {option.icon} {option.text}
        </>
      ),
      onClick: () => {
        setShortcutAvailability(option.value)
        if (option.value === 'hidden') {
          setAppVisibility({})
        }
      },
    }))

    items.splice(items.length - 1, 0, { divider: true })
    return items
  }, [setShortcutAvailability])

  const activeMenuItem = menuOptions.find((option) => option.value === shortcutAvailability)

  const getDescriptionText = (availability: AppAvailability, shortcutName: string) => {
    switch (availability) {
      case 'hidden':
        return `${shortcutName} will not appear in suggestions.`
      case 'all':
        return `${shortcutName} will always be suggested across all applications in Highlight.`
      case 'specific':
        return `Select the applications where ${shortcutName} will appear as a suggestion.`
      default:
        return `Set where and when ${shortcutName} should appear as a suggestion.`
    }
  }

  useEffect(() => {
    setAvailableApplications(appOptions.filter((option) => installedApplications.includes(option.id)))
  }, [installedApplications, appOptions])

  const visibleApps = useMemo(() => {
    if (isExpanded) {
      return availableApplications
    }

    return availableApplications.slice(0, 5)
  }, [isExpanded, availableApplications])

  useEffect(() => {
    if (!hasInitializedApps.current && appVisibility) {
      const appVisibilityKeys = Object.keys(appVisibility)
      const defaultAppIds = DEFAULT_APP_OPTIONS.map((app) => app.id)
      const customApps: AppOption[] = appVisibilityKeys
        .filter((app) => !defaultAppIds.includes(app))
        .map((app) => ({
          displayName: app,
          id: app,
          theme: 'dark',
          icon: <HashtagSquare variant="Bold" />,
        }))
      setAppOptions([...appOptions, ...customApps])
      hasInitializedApps.current = true
    }
  }, [appVisibility])

  const hiddenAppsCount = availableApplications.length - visibleApps.length

  const filteredApps = useMemo(() => {
    return installedApplications.filter(
      (app) => app.toLowerCase().includes(searchTerm.toLowerCase()) && !availableApplications.find((a) => a.id === app),
    )
  }, [searchTerm, installedApplications, availableApplications])

  const onAddApp = (app: string) => {
    setAppOptions([...appOptions, { displayName: app, id: app, theme: 'dark', icon: <HashtagSquare variant="Bold" /> }])
    setAppVisibility({
      ...appVisibility,
      [app]: true,
    })
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <h3 className="text-base font-semibold text-white">Shortcut Visibility</h3>
      <p className="text-xs font-normal leading-tight text-[#6e6e6e] mb-4">
        Decide where and when this shortcut will appear as a suggestion.
      </p>
      <ContextMenu
        key="app-selector-menu"
        items={contextMenuItems}
        position={'bottom'}
        triggerId={`toggle-app-selector`}
        leftClick={true}
        menuStyle={{ background: '#222222', borderColor: '#222222', width: '350px' }}
      >
        {
          // @ts-ignore
          () => (
            <Button
              id="toggle-app-selector"
              ref={buttonRef}
              size="sm"
              variant="default"
              className="flex w-[350px] items-center h-[42px] gap-2 justify-between bg-[#222222] hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2 text-sm">
                {activeMenuItem && (activeMenuItem as any).icon}
                {activeMenuItem && (activeMenuItem as any).text}
              </div>
              <ArrowDown2 size={16} />
            </Button>
          )
        }
      </ContextMenu>
      {shortcutAvailability === 'specific' && (
        <>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {visibleApps.map((app) => {
              const isVisible = appVisibility[app.id] || false
              return (
                <Tooltip key={app.id} tooltip={app.displayName} position="top">
                  <button
                    key={app.id}
                    onClick={() => toggleAppVisibility(app.id)}
                    className={`p-2 border h-12 rounded-lg flex items-center justify-start gap-2 text-xs overflow-hidden ${
                      isVisible ? 'border-green-40 bg-green-10' : 'border-[#252525] hover:bg-neutral-800/15'
                    }`}
                  >
                    <div
                      className="flex items-center justify-center h-7 w-7 rounded-md p-1.5 border-[0.25px] border-[#333333]"
                      style={{
                        background:
                          app.theme === 'dark'
                            ? 'linear-gradient(139deg, #333 3.52%, #161818 51.69%)'
                            : 'linear-gradient(139deg, #FFFFFF 3.52%, #E5E5E5 51.69%)',
                      }}
                    >
                      {app.icon}
                    </div>
                    <span className="truncate">{app.displayName}</span>
                  </button>
                </Tooltip>
              )
            })}
            {!isExpanded && appOptions.length > 5 && (
              <button
                onClick={() => setIsExpanded(true)}
                // className="relative border border-[#252525] h-12 hover:bg-neutral-800/15 rounded-lg flex items-center justify-between px-3 text-xs"
              >
                {/* <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
                  {appOptions
                    .slice(5)
                    .slice(0, 4)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="h-3.5 w-3.5 p-0.5 bg-[#2F2F2F] rounded-sm flex items-center justify-center"
                      >
                        {app.icon}
                      </div>
                    ))}
                </div> */}
                <span className="ml-2 bg-[#2f2f2f] py-2 px-2 rounded-md text-xs">{hiddenAppsCount} More</span>
                {/* {hiddenAppsCount > 0 && (
                  <div className="absolute top-0 -right-2 bg-green-60 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                   
                  </div>
                )} */}
              </button>
            )}
          </div>
          {installedApplications.length > availableApplications.length && (
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for more apps..."
                className="w-full p-2 text-xs bg-[#222222] border border-[#252525] rounded-lg focus:outline-none focus:border-green-40"
              />
              {showDropdown && filteredApps.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#222222] border border-[#252525] rounded-lg max-h-48 overflow-y-auto">
                  {filteredApps.map((app) => (
                    <button
                      key={app}
                      onClick={() => {
                        toggleAppVisibility(app)
                        setShowDropdown(false)
                        setSearchTerm('')
                        onAddApp(app)
                        setIsExpanded(true)
                      }}
                      className="w-full p-2 text-xs text-left hover:bg-neutral-800/15"
                    >
                      {app}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
