import changelogData from './changelog.json'

type Changelog = Array<{
  version: string
  releaseNotes: string
}>

export function useShowChangelog() {
  const notes: Changelog = changelogData
  const newestChangelogVersion = notes[0].version
  const highlightVersion = window.highlight.version

  console.log(highlightVersion)

  if (highlightVersion.includes(newestChangelogVersion) === false) return false

  const latestChangelogVersionDismissed = window.highlight.appStorage.get('changelog-version-dismissed') as string
  // window.highlight.appStorage.set('changelog-version-dismissed', undefined)

  if (latestChangelogVersionDismissed?.includes(newestChangelogVersion)) return false

  return true
}

export function useMostRecentChangelog() {
  const notes: Changelog = changelogData
  const mostRecentChangelogNote = notes[0]

  return mostRecentChangelogNote
}
