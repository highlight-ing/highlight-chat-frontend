import { useState, useEffect } from 'react'
import Button from '@/components/Button/Button'
import { ClipboardText } from 'iconsax-react'
import Highlight from '@highlight-ai/app-runtime'

export default function AutoTodoPromo() {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isAlphaChannel, setIsAlphaChannel] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canRunSlm, setCanRunSlm] = useState(false)
  const appId = 'autotask'

  useEffect(() => {
    async function checkReleaseChannel() {
      try {
        if (Highlight.app?.getReleaseChannel) {
          const channel = await Highlight.app.getReleaseChannel()
          setIsAlphaChannel(channel === 'alpha')
        }
      } catch (error) {
        console.debug('Release channel check failed:', error)
      }
    }
    checkReleaseChannel()
  }, [])

  useEffect(() => {
    async function checkIsInstalled() {
      try {
        if (Highlight.app?.isAppInstalled) {
          const isInstalled = await Highlight.app.isAppInstalled(appId)
          setIsInstalled(isInstalled)
        }
      } catch (error) {
        console.debug('Install check failed:', error)
      }
    }
    checkIsInstalled()
  }, [])

  useEffect(() => {
    async function checkCanRunSlm() {
      try {
        if (Highlight.inference?.isSlmCapable) {
          const canRunSlm = await Highlight.inference.isSlmCapable()
          setCanRunSlm(canRunSlm)
        }
      } catch (error) {
        console.debug('SLM capability check failed:', error)
      }
    }
    checkCanRunSlm()
  }, [])

  if (isDismissed || !isAlphaChannel || isInstalled || !canRunSlm) {
    return null
  }

  const handleDismissClick = async () => {
    Highlight.reporting?.trackEvent?.('autotask_dismiss_clicked')
    setIsDismissed(true)
  }

  const handleLearnMoreClick = async () => {
    Highlight.reporting?.trackEvent?.('autotask_learn_more_clicked')
    try {
      if (Highlight.app?.installApp && Highlight.app?.openApp) {
        await Highlight.app.installApp(appId)
        await Highlight.app.openApp(appId)
        setIsInstalled(true)
      }
    } catch (error) {
      console.error('Failed to open autotask app:', error)
    }
  }

  return (
    <div className="flex w-full items-center">
      <div className="inline-flex w-full items-center justify-between gap-2.5 rounded-[20px] border border-primary-20 bg-primary-5 px-6 py-4 transition-all hover:border-primary-40 hover:bg-primary-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-20">
            <ClipboardText size={24} color="#00e6f5" variant="Bold" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-base font-medium leading-normal text-light-100">
              Try Auto TODO
            </div>
            <div className="text-sm font-normal text-light-60">
              AI-powered task tracking from your screen activity
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="small"
            variant="tertiary"
            onClick={handleDismissClick}
          >
            Dismiss
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={handleLearnMoreClick}
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}