import React from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { ArrowRight } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'
import { isOnHomeAtom, showBackButtonAtom, sidePanelContentTypeAtom, sidePanelOpenAtom } from '@/atoms/side-panel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip } from '@/components/ui/tooltip'

import { headerHeightAtom, hoveringCloseAtom } from '../atoms'

function CloseHoverAnimateLayout(props: { children: React.ReactNode; className?: string }) {
  const hoveringClose = useAtomValue(hoveringCloseAtom)

  const hoveringCloseVariants: Variants = {
    idle: { translateX: 0, opacity: 1 },
    hover: (hoveringClose: boolean) => (hoveringClose ? { translateX: 12, opacity: 0.5 } : {}),
  }

  return (
    <motion.div
      variants={hoveringCloseVariants}
      custom={hoveringClose}
      initial="idle"
      animate="hover"
      className={cn(props.className)}
    >
      {props.children}
    </motion.div>
  )
}

function CloseSidePanelButton() {
  const setHoveringClose = useSetAtom(hoveringCloseAtom)
  const setSidePanelOpen = useSetAtom(sidePanelOpenAtom)

  function handleClick() {
    setSidePanelOpen(false)
    setHoveringClose(false)
  }

  return (
    <Tooltip content="Close" side="right">
      <div className="absolute -left-8 top-0">
        <motion.button
          onHoverStart={() => setHoveringClose(true)}
          onHoverEnd={() => setHoveringClose(false)}
          aria-label="Close Side Panel"
          onClick={handleClick}
          className="size-8 group relative grid place-items-center border border-t-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary"
        >
          <ArrowRight size={18} className="text-tertiary transition-colors group-hover:text-primary" />
        </motion.button>
      </div>
    </Tooltip>
  )
}

function AudioNoteViewerBackButton() {
  const setHoveringClose = useSetAtom(hoveringCloseAtom)
  const setSidePanelContentType = useSetAtom(sidePanelContentTypeAtom)
  const setShowBackButton = useSetAtom(showBackButtonAtom)

  function handleClick() {
    setHoveringClose(false)
    setShowBackButton(false)
    setSidePanelContentType('chat')
  }

  return (
    <Tooltip content="Back" side="right" align="start">
      <div className="absolute -left-5 top-0">
        <motion.button
          onHoverStart={() => setHoveringClose(true)}
          onHoverEnd={() => setHoveringClose(false)}
          aria-label="Close Transcript Viewer"
          onClick={handleClick}
          className="size-5 group relative grid place-items-center rounded-bl-lg border border-t-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary"
        >
          <ArrowRight size={12} className="text-tertiary transition-colors group-hover:text-primary" />
        </motion.button>
      </div>
    </Tooltip>
  )
}

export function SidePanel(props: { children: React.ReactNode; className?: string }) {
  const sidePanelOpen = useAtomValue(sidePanelOpenAtom)
  const isOnHome = useAtomValue(isOnHomeAtom)
  const showBackButton = useAtomValue(showBackButtonAtom)

  const sidePanelVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50, transition: { duration: 0.09 } },
  }

  return (
    <AnimatePresence mode="popLayout">
      {sidePanelOpen && (
        <motion.div
          variants={sidePanelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'sticky top-[104px] z-10 col-span-1 h-[calc(100vh-104px)] border-l border-tertiary text-primary',
            isOnHome && 'top-[48px] h-[calc(100vh-48px)]',
            props.className,
          )}
        >
          {props.children}
          {!isOnHome && <CloseSidePanelButton />}
          {showBackButton && <AudioNoteViewerBackButton />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SidePanelHeader(props: { children: React.ReactNode; className?: string }) {
  const [ref, bounds] = useMeasure()
  const setHeaderHeight = useSetAtom(headerHeightAtom)

  React.useEffect(() => {
    setHeaderHeight(bounds.height)
  }, [bounds, setHeaderHeight])

  return (
    <div ref={ref} className="overflow-x-hidden border-b border-tertiary">
      <CloseHoverAnimateLayout className={cn('space-y-2 p-5 pt-4', props.className)}>
        {props.children}
      </CloseHoverAnimateLayout>
    </div>
  )
}

export function SidePanelHeaderActionButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'flex w-full flex-col items-center rounded-[10px] border border-transparent bg-secondary p-2 text-sm font-medium tracking-tight text-tertiary shadow-md transition hover:border-tertiary hover:bg-hover active:opacity-90 active:shadow-none',
        className,
      )}
      {...props}
    />
  )
}

export function SidePanelHeaderActions(props: { children: React.ReactNode }) {
  return <div className="flex w-full gap-2.5">{props.children}</div>
}

export function SidePanelContent(props: { children: React.ReactNode; className?: string }) {
  const headerHeight = useAtomValue(headerHeightAtom)

  return (
    <ScrollArea style={{ height: `calc(100% - ${headerHeight}px` }} className="overflow-x-hidden">
      <CloseHoverAnimateLayout className={cn('w-full space-y-6 p-4 pt-6', props.className)}>
        {props.children}
      </CloseHoverAnimateLayout>
    </ScrollArea>
  )
}
