import RelatedApp, { RelatedAppProps } from './RelatedApp'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import Buttons from './Buttons'
import Video from './Video'

function IconPlaceholder() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#712FFF" fillOpacity="0.2" />
      <path
        d="M38.9835 15.334H25.0168C18.9502 15.334 15.3335 18.9507 15.3335 25.0173V38.9673C15.3335 45.0507 18.9502 48.6673 25.0168 48.6673H38.9668C45.0335 48.6673 48.6502 45.0507 48.6502 38.984V25.0173C48.6668 18.9507 45.0502 15.334 38.9835 15.334ZM26.1668 22.634C27.8835 22.634 29.3002 24.034 29.3002 25.7673C29.3002 27.5007 27.9002 28.9007 26.1668 28.9007C24.4335 28.9007 23.0335 27.4673 23.0335 25.7507C23.0335 24.034 24.4502 22.634 26.1668 22.634ZM32.0002 43.8006C27.5168 43.8006 23.8668 40.1507 23.8668 35.6673C23.8668 34.5007 24.8168 33.534 25.9835 33.534H37.9835C39.1502 33.534 40.1002 34.484 40.1002 35.6673C40.1335 40.1507 36.4835 43.8006 32.0002 43.8006ZM37.8335 28.8673C36.1168 28.8673 34.7002 27.4673 34.7002 25.734C34.7002 24.0007 36.1002 22.6007 37.8335 22.6007C39.5668 22.6007 40.9668 24.0007 40.9668 25.734C40.9668 27.4673 39.5502 28.8673 37.8335 28.8673Z"
        fill="#712FFF"
      />
    </svg>
  )
}

export interface PromptListingPageProps {
  externalId: string
  name: string
  slug: string
  author: string
  description: string
  videoUrl?: string
  relatedApps: RelatedAppProps[]
  image?: string
  imageExtension?: string
}

/**
 * A prompt store page, this is the page that shows an individual prompt.
 */
export default function PromptListingPage({
  externalId,
  name,
  slug,
  author,
  description,
  videoUrl,
  relatedApps,
  image,
  imageExtension,
}: PromptListingPageProps) {
  const newVideoUrl = videoUrl ?? 'https://vimeo.com/1001298855'

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex basis-1/2 flex-col justify-center gap-3">
          <div className="flex gap-3">
            {image && imageExtension ? (
              <PromptAppIcon className="h-16 w-16 rounded-full" imageId={image} imageExtension={imageExtension} />
            ) : (
              <IconPlaceholder />
            )}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl">{name}</h1>
              <h6 className="text-light-60">Created by {author}</h6>
            </div>
          </div>
          <div className="mt-16">
            <Buttons externalId={externalId} slug={slug} />
          </div>
        </div>
        {newVideoUrl && (
          <div className="aspect-w-16 aspect-h-9 flex items-center justify-center">
            <Video url={newVideoUrl} />
          </div>
        )}
      </div>
      <hr className="my-10 h-px border-0 bg-light-5" />
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex basis-1/2 flex-col gap-4">
          <div className="space-y-2">
            <h4 className="text-light-20">Description</h4>
            <p className="text-light-60">{description}</p>
          </div>
        </div>
        <div className="flex basis-1/2 flex-col gap-3">
          <h4 className="text-light-20">Related Apps</h4>
          {relatedApps.map((app) => (
            <RelatedApp key={app.slug} {...app} />
          ))}
        </div>
      </div>
    </div>
  )
}
