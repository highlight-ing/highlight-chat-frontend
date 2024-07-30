import styles from "@/components/ChatHome/chathome.module.scss";
import {Setting} from "iconsax-react";
import React from "react";
import {PromptProps} from "@/types";
import {useStore} from "@/providers/store-provider";

interface PromptListRowProps {
  prompt: PromptProps
  type: 'prompt' | 'official'
}
const PromptListRow = ({prompt, type}: PromptListRowProps) => {
  const {openModal} = useStore((state) => state)

  return (
    <div key={prompt.slug} className={`${styles.promptOption} ${styles[type]}`} onClick={() => openModal('prompts-modal', {prompt})}>
      <div className={styles.promptIcon}>
        <Setting variant={"Bold"}/>
      </div>
      <div className="flex flex-col mt-0.5">
        <span className={styles.promptName}>{prompt.name}</span>
        <span>{prompt.description}</span>
      </div>
    </div>
  )
}

export default PromptListRow
