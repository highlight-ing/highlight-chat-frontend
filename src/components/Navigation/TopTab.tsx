import styles from "@/components/Navigation/top-bar.module.scss";
import {MessageText} from "iconsax-react";
import * as React from "react";
import {ChatHistoryItem} from "@/types";
import {useEffect, useRef, useState} from "react";
import TypedText from "@/components/TypedText/TypedText";

interface TopTabProps {
  isActive?: boolean
  conversation: ChatHistoryItem
  onOpen: (conversation: ChatHistoryItem) => void
}
const TopTab = ({isActive, conversation, onOpen}: TopTabProps) => {
  const filteredTitle = conversation.title.charAt(0) === '"' && conversation.title.charAt(conversation.title.length - 1) === '"'
    ? conversation.title.substring(1, conversation.title.length - 1)
    : conversation.title
  const initialTitleRef = useRef(filteredTitle)
  const [title, setTitle] = useState(filteredTitle)

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
      className={`${styles.tab} ${isActive ? styles.active : ''}`}
      onClick={() => onOpen(conversation)}
    >
      <MessageText size={20} variant={'Bold'}/>
      {
        initialTitleRef.current === title
          ? <span className={'overflow-ellipsis whitespace-nowrap overflow-hidden max-w-full'}>
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
  )
}

export default TopTab
