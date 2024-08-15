import CodeEditor from '@uiw/react-textarea-code-editor'
import { Gallery, Monitor, Sound, User } from 'iconsax-react'
import Button from "@/components/Button/Button";
import variables from '@/variables.module.scss'

/**
 * PromptInput is a component that allows the user to input a prompt with
 * buttons to insert variables into that prompt.
 */
export default function PromptInput({
  value,
  onChange,
  placeholder,
}: {
  value?: string
  onChange?: (prompt: string) => void
  placeholder?: string
}) {
  const onVariableClick = (variable: string) => {
    onChange?.(value + variable)
  }

  return (
    <>
      <div className="flex flex-row gap-2 py-3 pb-3">
        <Button
          size={'medium'}
          variant={'ghost-neutral'}
          onClick={() => onVariableClick('{{image}}')}
        >
          <Gallery variant="Bold" size={16} color="#FF2099" />
          Image
        </Button>
        <Button
          size={'medium'}
          variant={'ghost-neutral'}
          onClick={() => onVariableClick('{{screen}}')}
        >
          <Monitor variant="Bold" size={16} color="#FF2099" />
          Screen
        </Button>
        <Button
          size={'medium'}
          variant={'ghost-neutral'}
          onClick={() => onVariableClick('{{audio}}')}
        >
          <Sound variant="Bold" size={16} color={variables.green60} />
          Audio
        </Button>
        <Button
          size={'medium'}
          variant={'ghost-neutral'}
          onClick={() => onVariableClick('{{about_me}}')}
        >
          <User variant="Bold" size={16} color={'#ECFF0C'} />
          About Me
        </Button>
      </div>
      <div className={'h-full'}>
        <CodeEditor
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          language="handlebars"
          placeholder={placeholder}
          style={{
            backgroundColor: 'inherit',
            fontSize: '16px',
            height: '100%',
            overflowY: 'auto'
          }}
        />
      </div>
    </>
  )
}
