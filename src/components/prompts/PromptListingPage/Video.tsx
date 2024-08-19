import videoParser from 'js-video-url-parser'

/**
 * Component that parses the video URL and renders the appropriate video player.
 * Supports YouTube and Vimeo.
 */
export default function Video({ url }: { url: string }) {
  const parsedVideo = videoParser.parse(url)

  if (!parsedVideo?.provider) {
    return <></>
  }

  if (parsedVideo.provider === 'youtube') {
    return <iframe width="640" height="360" src={`https://www.youtube.com/embed/${parsedVideo.id}`}></iframe>
  }

  if (parsedVideo.provider === 'vimeo') {
    return <iframe width="640" height="360" src={`https://player.vimeo.com/video/${parsedVideo.id}`}></iframe>
  }

  return <></>
}
