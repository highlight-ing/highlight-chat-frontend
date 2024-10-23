import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react'
import { Portal } from 'react-portal'
import { calculatePositionedStyle } from '@/utils/components'
import { Document, Grid6 } from 'iconsax-react'
import { NotionParentItem } from '@/types'
import { emptyTextBlock, getDecorations } from '@/utils/notion'
import { Text } from 'react-notion-x'
import styles from './notiondropdown.module.scss'

type Position = 'top' | 'bottom' | 'left' | 'right'

interface ContextMenuProps {
  disabled?: boolean
  leftClick?: boolean
  offset?: number
  position: Position
  triggerId: string
  hidden?: boolean
  items: NotionParentItem[]
  onItemSelect: (item: NotionParentItem) => void
}

const NotionDropdown = ({
  disabled,
  children,
  triggerId,
  position,
  leftClick,
  offset = 0,
  hidden,
  items,
  onItemSelect,
}: PropsWithChildren<ContextMenuProps>) => {
  const [isOpen, setOpen] = useState(false)
  const [appliedStyle, setAppliedStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const elemRef = useRef<HTMLDivElement>(null)

  function recalculatePosition() {
    if (!containerRef.current || !elemRef.current) {
      return
    }
    const styles = calculatePositionedStyle(containerRef.current, elemRef.current, position, offset)
    setAppliedStyle(styles)
  }

  const onClickOutsideListener = useCallback(
    (e: MouseEvent) => {
      const el = containerRef.current
      // @ts-ignore
      if (isOpen && el && !el.contains(e.target)) {
        setOpen(false)
      }
    },
    [isOpen],
  )

  function handleItemSelect(item: NotionParentItem) {
    onItemSelect(item)
    setOpen(false)
  }

  useEffect(() => {
    if (disabled) {
      return
    }

    const onTrigger = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const triggerContainsTarget = document.getElementById(triggerId)?.contains(target)
      const targetContainsTrigger = false //!triggerContainsTarget && target.contains(document.getElementById(triggerId))
      if (triggerContainsTarget || targetContainsTrigger) {
        setOpen(!isOpen)
      }
    }

    document.addEventListener(leftClick ? 'click' : 'contextmenu', onTrigger)
    return () => {
      document.removeEventListener(leftClick ? 'click' : 'contextmenu', onTrigger)
    }
  }, [isOpen, triggerId, disabled, leftClick])

  useEffect(() => {
    document.addEventListener('click', onClickOutsideListener)
    document.addEventListener('contextmenu', onClickOutsideListener)
    return () => {
      document.removeEventListener('click', onClickOutsideListener)
      document.removeEventListener('contextmenu', onClickOutsideListener)
    }
  }, [onClickOutsideListener])

  useEffect(() => {
    recalculatePosition()
  }, [isOpen])

  if (disabled) {
    return typeof children === 'function'
      ? // @ts-ignore
        children({ isOpen })
      : children
  }

  return (
    <div className={`relative h-fit w-fit ${hidden ? 'hidden' : ''}`} ref={containerRef}>
      {typeof children === 'function'
        ? // @ts-ignore
          children({ isOpen })
        : children}
      {isOpen && (
        <Portal>
          <div className={styles.notionDropdown} ref={elemRef} style={{ ...appliedStyle }}>
            <div className="inline-flex max-h-[300px] w-[210px] flex-col items-stretch justify-start overflow-y-auto overflow-x-clip rounded-2xl border border-[#222222] shadow">
              <div className="inline-flex items-center justify-start gap-2.5 bg-[#191919] pb-1 pl-4 pr-3 pt-3">
                <div className="text-[13px] font-medium leading-none text-[#484848]">Databases</div>
              </div>
              {items
                .filter((item) => item.type === 'database')
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="inline-flex items-center justify-start gap-3 bg-[#191919] px-4 py-2 hover:cursor-pointer hover:bg-[#222222]"
                  >
                    <div className="flex h-5 w-5 items-center justify-center">
                      <div className="relative h-5 w-5">
                        <Grid6 variant="Bold" size={20} />
                      </div>
                    </div>
                    <div className="inline-flex flex-col items-start justify-center">
                      <div className="text-[13px] font-medium leading-none text-[#b4b4b4]">
                        <Text value={getDecorations(item.title)} block={emptyTextBlock} />
                      </div>
                    </div>
                  </div>
                ))}
              <div className="inline-flex h-8 items-center justify-start gap-2.5 bg-[#191919] pb-1 pl-4 pr-3 pt-3">
                <div className="text-[13px] font-medium leading-none text-[#484848]">Pages</div>
              </div>
              {items
                .filter((item) => item.type === 'page')
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="inline-flex items-center justify-start gap-3 bg-[#191919] px-4 py-2 hover:cursor-pointer hover:bg-[#222222]"
                  >
                    <div className="flex h-5 w-5 items-center justify-center">
                      <div className="relative h-5 w-5">
                        <Document variant="Bold" size={20} />
                      </div>
                    </div>
                    <div className="inline-flex flex-col items-start justify-center">
                      <div className="text-ellipsis text-[13px] font-medium leading-none text-[#b4b4b4]">
                        <Text value={getDecorations(item.title)} block={emptyTextBlock} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}

export default NotionDropdown
