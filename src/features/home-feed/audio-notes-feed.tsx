import { useAudioNotes } from './hooks'

export function AudioNotesFeed() {
  const { data, isLoading } = useAudioNotes()

  console.log(data)

  if (isLoading) {
    return <div className="mt-12">Loading audio notes...</div>
  }

  return <div className="mt-12">Audio notes</div>
}
