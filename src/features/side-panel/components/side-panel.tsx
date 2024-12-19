import React from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { ArrowRight } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'
import { isOnHomeAtom, sidePanelOpenAtom } from '@/atoms/side-panel'
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

function CloseTranscriptViewerButton() {
  const setHoveringClose = useSetAtom(hoveringCloseAtom)
  const setTranscriptOpen = useSetAtom(sidePanelOpenAtom)

  function handleClick() {
    setTranscriptOpen(false)
    setHoveringClose(false)
  }

  return (
    <Tooltip content="Close" side="right">
      <div className="absolute -left-8 top-0">
        <motion.button
          onHoverStart={() => setHoveringClose(true)}
          onHoverEnd={() => setHoveringClose(false)}
          aria-label="Close Transcript Viewer"
          onClick={handleClick}
          className="size-8 group relative grid place-items-center border border-t-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary"
        >
          <ArrowRight size={18} className="text-tertiary transition-colors group-hover:text-primary" />
        </motion.button>
      </div>
    </Tooltip>
  )
}

export function SidePanel(props: { children: React.ReactNode; hideCloseButton?: boolean }) {
  const sidePanelOpen = useAtomValue(sidePanelOpenAtom)
  const isOnHome = useAtomValue(isOnHomeAtom)

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
          )}
        >
          {props.children}
          {!props.hideCloseButton && <CloseTranscriptViewerButton />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SidePanelHeader(props: { children: React.ReactNode }) {
  const [ref, bounds] = useMeasure()
  const setHeaderHeight = useSetAtom(headerHeightAtom)

  React.useEffect(() => {
    setHeaderHeight(bounds.height)
  }, [bounds, setHeaderHeight])

  return (
    <div ref={ref} className="overflow-x-hidden border-b border-tertiary">
      <CloseHoverAnimateLayout className="space-y-2 p-4">{props.children}</CloseHoverAnimateLayout>
    </div>
  )
}

export function SidePanelContent(props: { children: React.ReactNode }) {
  const headerHeight = useAtomValue(headerHeightAtom)

  return (
    <ScrollArea style={{ height: `calc(100% - ${headerHeight}px` }} className="overflow-x-hidden">
      <CloseHoverAnimateLayout className="w-full space-y-6 p-4 pt-6">{props.children}</CloseHoverAnimateLayout>
    </ScrollArea>
  )
}
