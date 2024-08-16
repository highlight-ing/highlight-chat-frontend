import styles from "@/components/Navigation/top-bar.module.scss";
import {MessageText} from "iconsax-react";
import * as React from "react";
import {ChatHistoryItem} from "@/types";
import {CSSProperties, PropsWithChildren, useEffect, useRef, useState} from "react";
import TypedText from "@/components/TypedText/TypedText";
import CircleButton from "@/components/CircleButton/CircleButton";

interface TopTabProps {
  isActive?: boolean
  isDragging?: boolean
  conversation: ChatHistoryItem
  onOpen: (conversation: ChatHistoryItem) => void
  onClose: (conversation: ChatHistoryItem) => void
  style?: CSSProperties
}
const TopTab = React.forwardRef<HTMLDivElement, TopTabProps>(
  ({isActive, isDragging, conversation, onOpen, onClose, ...props}, ref) => {
    const filteredTitle = conversation.title.charAt(0) === '"' && conversation.title.charAt(conversation.title.length - 1) === '"'
      ? conversation.title.substring(1, conversation.title.length - 1)
      : conversation.title
    const initialTitleRef = useRef(filteredTitle)
    const [title, setTitle] = useState(filteredTitle)
    const [isAnimating, setIsAnimating] = useState(true)

    useEffect(() => {
      const filteredTitle = conversation.title.charAt(0) === '"' && conversation.title.charAt(conversation.title.length - 1) === '"'
        ? conversation.title.substring(1, conversation.title.length - 1)
        : conversation.title
      if (filteredTitle !== title) {
        setTitle(filteredTitle)
      }
    }, [conversation.title, title])

    return (
      <div
        ref={ref}
        {...props}
        className={styles.tabContainer}
      >
        <div
          className={`${styles.tab} ${isActive ? styles.active : ''} ${isAnimating && !isDragging ? styles.isAnimating : ''}`}
          onClick={() => onOpen(conversation)}
          onAnimationEnd={() => setIsAnimating(false)}
        >
          <MessageText size={17} variant={'Bold'}/>
          {
            initialTitleRef.current === title
              ? <span className={'overflow-ellipsis whitespace-nowrap overflow-hidden max-w-full'} style={{lineHeight: 2}}>
                {
                  conversation.title.charAt(0) === '"' && conversation.title.charAt(conversation.title.length - 1) === '"'
                    ? conversation.title.substring(1, conversation.title.length - 1)
                    : conversation.title
                }
              </span>
              : <TypedText
                text={
                  conversation.title.charAt(0) === '"' && conversation.title.charAt(conversation.title.length - 1) === '"'
                    ? conversation.title.substring(1, conversation.title.length - 1)
                    : conversation.title
                }
                className={'overflow-ellipsis whitespace-nowrap overflow-hidden max-w-full'}
              />

          }
        </div>
        <div className={styles.tabClose}>
          <CircleButton onClick={() => onClose(conversation)} size={'20px'}>
            <TabCloseIcon size={20.5}/>
          </CircleButton>
        </div>
      </div>
    )
  }
)

export default TopTab

const TabCloseIcon = ({size}: {size: number}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="16" width="13" height="2.5" rx="1.25" transform="rotate(-45 7 16)" fill="white"/>
      <rect width="13" height="2.5" rx="1.25" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 18 16)" fill="white"/>
    </svg>
  )
}
