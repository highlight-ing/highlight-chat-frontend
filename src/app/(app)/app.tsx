import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { ModalContainer } from '@/components/modals/ModalContainer'
import Modals from '@/components/modals/Modals'
import ToastContainer from '@/components/Toast/ToastContainer'

import { useAboutMeRegister } from '@/features/app-layout/hooks/use-about-me-register'
import { useAuthChangeHandler } from '@/features/app-layout/hooks/use-auth-change-handler'
import { useContextReceivedHandler } from '@/features/app-layout/hooks/use-context-received-handler'
import { useInitializeAmplitudeAndSentry } from '@/features/app-layout/hooks/use-initialize-amplitude-and-sentry'
import { useShowFollowUpFeedbackToast } from '@/features/app-layout/hooks/use-show-follow-up-feedback-toast'
import { ChangelogModal } from '@/features/changelog/changelog-modal'
import { usePendingIntegrations } from '@/features/integrations/_hooks/use-pending-integrations'

export function App({ children }: { children: React.ReactNode }) {
  useContextReceivedHandler()
  useAboutMeRegister()
  useAuthChangeHandler()
  useShowFollowUpFeedbackToast()
  usePendingIntegrations()
  useInitializeAmplitudeAndSentry()

  return (
    <>
      {children}
      <Modals />
      <ModalContainer />
      <ToastContainer />
      <ChangelogModal />
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
    </>
  )
}
