import {PropsWithChildren} from "react";
import SyntaxHighlighter from 'react-syntax-highlighter'
import {darcula} from "react-syntax-highlighter/dist/esm/styles/hljs";
import Button from "@/components/Button/Button";
import styles from './message.module.scss'
import {Copy} from "iconsax-react";

interface CodeBlockProps {
  language: string
}

const CodeBlock = ({children, language}: PropsWithChildren<CodeBlockProps>) => {
  const code = children as (string | string[])
  const onCopy = () => {
    navigator.clipboard.writeText(typeof code === 'string' ? code : code.join('\n'))
  }
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBlockHeader}>
        {language}
        <Button size={'small'} variant={'ghost-neutral'} onClick={onCopy}>
          <Copy variant={"Linear"} size={16}/> Copy Code
        </Button>
      </div>
      <div className="overflow-x-auto" style={{width: '100%'}}>
        <SyntaxHighlighter language={language} style={darcula} customStyle={{backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '12px', boxSizing: 'border-box'}}>
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default CodeBlock
