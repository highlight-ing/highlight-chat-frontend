'use client'

import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { ModalContainer } from '@/components/modals/ModalContainer'
import Modals from '@/components/modals/Modals'
import ToastContainer from '@/components/Toast/ToastContainer'

import { ChangelogModal } from '@/features/changelog/changelog-modal'

import { usePendingIntegrations } from '../integrations/_hooks/use-pending-integrations'
import { useAboutMeRegister } from './hooks/use-about-me-register'
import { useAuthChangeHandler } from './hooks/use-auth-change-handler'
import { useCheckHighlightIsRunning } from './hooks/use-check-highlight-is-running'
import { useContextReceivedHandler } from './hooks/use-context-received-handler'
import { useInitializeAmplitudeAndSentry } from './hooks/use-initialize-amplitude-and-sentry'
import { useShowFollowUpFeedbackToast } from './hooks/use-show-follow-up-feedback-toast'

export function App(props: { children: React.ReactNode }) {
  usePendingIntegrations()
  useCheckHighlightIsRunning()
  useAboutMeRegister()
  useAuthChangeHandler()
  useShowFollowUpFeedbackToast()
  useInitializeAmplitudeAndSentry()
  useContextReceivedHandler()

  return (
    <>
      {props.children}
      <Modals />
      <ModalContainer />
      <ToastContainer />
      <ChangelogModal />
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
    </>
  )
}
