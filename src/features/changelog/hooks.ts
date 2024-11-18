import React from 'react'

import changelogData from './changelog.json'

type Changelog = Array<{
  version: string
  releaseNotes: string
}>

export function useShowChangelog() {
  const [showChangelog, setShowChangelog] = React.useState(false)
  const notes: Changelog = changelogData
  const newestChangelogVersion = notes[0].version

  React.useEffect(() => {
    const highlightVersion = window.highlight.version
    if (highlightVersion.includes(newestChangelogVersion) === false) return

    const latestChangelogVersionDismissed = window.highlight.appStorage.get('changelog-version-dismissed') as string
    if (latestChangelogVersionDismissed?.includes(newestChangelogVersion)) return

    setShowChangelog(true)
  }, [])

  return { showChangelog, setShowChangelog }
}

export function useChangelogs() {
  const notes: Changelog = changelogData
  const mostRecentChangelogNote = notes[0]

  return { allChangelogNotes: notes, mostRecentChangelogNote }
}
