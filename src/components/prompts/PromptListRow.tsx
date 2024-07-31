import styles from "@/components/ChatHome/chathome.module.scss";
import {ArrowRight, Setting} from "iconsax-react";
import React from "react";
import {PromptApp} from "@/types";

interface PromptListRowProps {
  prompt: PromptApp
  icon?: React.ReactElement
  type: 'prompt' | 'official'
  onClick: (e: React.MouseEvent) => void
}
const PromptListRow = ({prompt, icon, type, onClick}: PromptListRowProps) => {
  return (
    <div key={prompt.slug} className={`${styles.promptOption} ${styles[type]}`} onClick={onClick}>
      <div className={styles.promptIcon}>
        {icon ?? <Setting variant={"Bold"}/>}
      </div>
      <div className="flex flex-col mt-0.5">
        {
          prompt.name &&
          <span className={styles.promptName}>{prompt.name}</span>
        }
        {
          prompt.description &&
          <span>{prompt.description}</span>
        }
      </div>
      <div className={styles.promptArrow}>
        <ArrowRight size={20}/>
      </div>
    </div>
  )
}

export default PromptListRow
