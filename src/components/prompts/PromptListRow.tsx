import styles from "@/components/ChatHome/chathome.module.scss";
import {ArrowRight, Edit2, MessageProgramming, MessageText, Setting} from "iconsax-react";
import React from "react";
import {PromptApp} from "@/types";
import CircleButton from "@/components/CircleButton/CircleButton";
import Tooltip from "@/components/Tooltip/Tooltip";

interface PromptListRowProps {
  prompt: PromptApp
  icon?: React.ReactElement
  type: 'self' | 'community' | 'official' | 'default'
  onClick: (e: React.MouseEvent) => void
  onClickEdit?: (e: React.MouseEvent) => void
  isCta?: boolean
}
const PromptListRow = ({prompt, icon, type, isCta, onClick, onClickEdit}: PromptListRowProps) => {
  return (
    <div key={prompt.slug} className={`${styles.promptOption} ${styles[type]}`} onClick={onClick}>
      <div className={styles.promptIcon}>
        {icon ?? <MessageText variant={"Bold"}/>}
      </div>
      <div className="flex flex-col mt-0.5 flex-1">
        {
          prompt.name &&
          <span className={styles.promptName}>{prompt.name}</span>
        }
        {
          prompt.description &&
          <span className={`${styles.promptDescription} ${isCta ? styles.isCta : ''}`}>{prompt.description}</span>
        }
      </div>
      <div className={`${styles.promptArrow} ${(isCta || typeof onClickEdit === 'function') ? styles.show : ''}`}>
        {
          typeof onClickEdit === 'function' &&
          <Tooltip tooltip={'Edit Prompt'} position={'left'}>
            <CircleButton onClick={e => {
              e.stopPropagation()
              onClickEdit(e)
            }}>
              <Edit2 variant={"Bold"}/>
            </CircleButton>
          </Tooltip>
        }
        {
          typeof onClickEdit === 'undefined' &&
          <>
            {
              isCta &&
              <span>Start Chat</span>
            }
            <ArrowRight size={20}/>
          </>
        }
      </div>
    </div>
  )
}

export default PromptListRow
