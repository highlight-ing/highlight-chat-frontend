import Button from '@/components/Button/Button'

function AppIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#712FFF" fill-opacity="0.2" />
      <path
        d="M37.587 18.668H26.4137C21.5603 18.668 18.667 21.5613 18.667 26.4146V37.5746C18.667 42.4413 21.5603 45.3346 26.4137 45.3346H37.5737C42.427 45.3346 45.3203 42.4413 45.3203 37.588V26.4146C45.3337 21.5613 42.4403 18.668 37.587 18.668ZM27.3337 24.508C28.707 24.508 29.8403 25.628 29.8403 27.0146C29.8403 28.4013 28.7203 29.5213 27.3337 29.5213C25.947 29.5213 24.827 28.3746 24.827 27.0013C24.827 25.628 25.9603 24.508 27.3337 24.508ZM32.0003 41.4413C28.4137 41.4413 25.4937 38.5213 25.4937 34.9346C25.4937 34.0013 26.2537 33.228 27.187 33.228H36.787C37.7203 33.228 38.4803 33.988 38.4803 34.9346C38.507 38.5213 35.587 41.4413 32.0003 41.4413ZM36.667 29.4946C35.2937 29.4946 34.1603 28.3746 34.1603 26.988C34.1603 25.6013 35.2803 24.4813 36.667 24.4813C38.0537 24.4813 39.1737 25.6013 39.1737 26.988C39.1737 28.3746 38.0403 29.4946 36.667 29.4946Z"
        fill="#712FFF"
      />
    </svg>
  )
}

export default function SettingsScreen() {
  return (
    <div className="flex justify-between pt-10">
      <div className="flex basis-1/2 flex-col gap-4">
        <div className="flex items-center space-x-6">
          <AppIcon />
          <Button size="small" variant="secondary">
            Upload Image
          </Button>
        </div>
        <div className="flex flex-col space-y-2">
          <span className="font-medium text-white">Name</span>
        </div>
        <div>
          <span className="font-medium text-white">Description</span>
        </div>
        <div>
          <span className="font-medium text-white">Video Link</span>
        </div>
      </div>

      <div className="flex basis-1/2 flex-col gap-2">
        <div className="rounded-lg border border-white/10 bg-[#161617] p-3">
          <h4 className="text-lg font-medium text-white">Visibility</h4>
          <p className="text-sm text-white opacity-60">Publish your app to the Highlight app store</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#161617] p-3">
          <div>
            <h4 className="text-lg font-medium text-white">Share Link</h4>
            <p className="text-sm text-white opacity-60">https://chat.highlight.ing/prompt/123</p>
          </div>
          <div>
            <Button size="small" variant="secondary">
              Copy Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
