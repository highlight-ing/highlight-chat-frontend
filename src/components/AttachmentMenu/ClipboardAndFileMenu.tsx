import { useEffect, useRef } from 'react'
import { ClipboardText, DocumentUpload } from 'iconsax-react'
import Highlight from '@highlight-ai/app-runtime'
import { PaperclipIcon } from '@/icons/icons'
import ContextMenu, { MenuItemType } from '../ContextMenu/ContextMenu'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import styles from './attachment-menus.module.scss'
import Tooltip from '@/components/Tooltip/Tooltip'
import mammoth from 'mammoth'
import * as pptxtojson from 'pptxtojson'
import { trackEvent } from '@/utils/amplitude'
import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import { MAX_NUMBER_OF_ATTACHMENTS } from '@/stores/chat-attachments'

export const ClipboardAndFileMenu = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messages = useCurrentChatMessages()

  const { attachments, setFileInputRef, addAttachment } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      addAttachment: state.addAttachment,
      setFileInputRef: state.setFileInputRef,
    })),
  )

  useEffect(() => {
    setFileInputRef(fileInputRef)
  }, [fileInputRef])

  const handleAttachmentClick = () => {
    fileInputRef?.current?.click()
    trackEvent('HL Chat Attachments Button Clicked', {})
  }

  const readTextFile = async (file: File): Promise<string> => {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  const extractTextFromPowerPoint = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const json = await pptxtojson.parse(arrayBuffer)

    const cleanText = (text: string): string => {
      return text
        .replace(/&nbsp;/g, ' ')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const slideText = json.slides
      .map((slide, index) => {
        const slideNumber = index + 1
        const slideContent = slide.elements
          .filter((e) => e.type === 'text')
          .map((e) => cleanText(e.content))
          .filter((text) => text.length > 0)
          .join('\n')

        return slideContent.length > 0 ? `[Slide ${slideNumber}]\n${slideContent}` : ''
      })
      .filter((text) => text.length > 0)
      .join('\n\n')

    return slideText
  }

  const textBasedTypes = [
    'application/json',
    'application/xml',
    'application/javascript',
    'application/typescript',
    'application/x-sh',
  ]

  const onAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Process each file
        if (file.type.startsWith('image/')) {
          addAttachment({
            type: 'image',
            value: URL.createObjectURL(file),
            file: file,
          })
          trackEvent('HL Chat Attachment Added', { type: 'image', fileType: file.type })
        } else if (file.type === 'application/pdf') {
          addAttachment({
            type: 'pdf',
            value: file,
          })
          trackEvent('HL Chat Attachment Added', { type: 'pdf' })
        } else if (
          file.type === 'text/csv' ||
          file.type === 'application/vnd.ms-excel' ||
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          addAttachment({
            type: 'spreadsheet',
            value: file,
          })
          trackEvent('HL Chat Attachment Added', { type: 'spreadsheet', fileType: file.type })
        } else if (
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'application/msword'
        ) {
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })
          addAttachment({
            type: 'text_file',
            value: result.value,
            fileName: file.name,
          })
          trackEvent('HL Chat Attachment Added', { type: 'text_file', fileType: file.type })
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
          const value = await extractTextFromPowerPoint(file)
          addAttachment({
            type: 'text_file',
            value,
            fileName: file.name,
          })
          trackEvent('HL Chat Attachment Added', { type: 'power_point', fileType: file.type })
        } else if (
          textBasedTypes.includes(file.type) ||
          file.type.includes('application/') ||
          file.type.includes('text/')
        ) {
          const value = await readTextFile(file)
          addAttachment({
            type: 'text_file',
            value,
            fileName: file.name,
          })
          trackEvent('HL Chat Attachment Added', { type: 'text_file', fileType: file.type })
        } else {
          try {
            const value = await readTextFile(file)
            addAttachment({
              type: 'text_file',
              value,
              fileName: file.name,
            })
            trackEvent('HL Chat Attachment Added', { type: 'file', fileType: file.type })
          } catch (e) {
            console.log('Error reading file', file.name, e)
          }
        }
      }
    }
  }

  const onAddClipboard = async () => {
    const hasClipboardReadPermission = await Highlight.permissions.requestClipboardReadPermission()

    if (!hasClipboardReadPermission) {
      console.log('Clipboard read permission denied')
      trackEvent('HL Chat Permission Denied', { type: 'clipboard' })
      return
    }

    const clipboard = await Highlight.user.getClipboardContents()
    if (!clipboard) return

    if (clipboard.type === 'image') {
      addAttachment({
        type: 'image',
        value: clipboard.value,
      })
      trackEvent('HL Chat Attachment Added', { type: 'clipboard_image' })
    } else {
      addAttachment({
        type: 'clipboard',
        value: clipboard.value,
      })
      trackEvent('HL Chat Attachment Added', { type: 'clipboard_text' })
    }
  }

  const menuItems = [
    {
      label: (
        <div className={styles.menuItem}>
          <div className={styles.iconWrapper}>
            <ClipboardText size={20} variant={'Bold'} />
          </div>
          Clipboard
        </div>
      ),
      onClick: onAddClipboard,
    },
    {
      label: (
        <div className={styles.menuItem}>
          <div className={styles.iconWrapper}>
            <DocumentUpload size={20} variant={'Bold'} />
          </div>
          Upload file
        </div>
      ),
      onClick: handleAttachmentClick,
    },
  ].filter(Boolean) as MenuItemType[]

  const acceptTypes =
    'text/*,image/*,application/*,application/pdf,application/json,application/xml,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,.txt,.rtf,.md,.markdown,.mdown,.mkdn,.mdwn,.mkd,.org,.rst,.tex,.log,.ini,.cfg,.conf,.yml,.yaml,.toml,.json,.xml,.csv,.tsv,.js,.jsx,.ts,.tsx,.py,.rb,.rs,.swift,.java,.kt,.go,.php,.pl,.sh,.bash,.zsh,.fish,.sql,.html,.htm,.xhtml,.css,.scss,.sass,.less,.svg,.cjs,.mjs,.cts,.mts,.vue,.svelte,.astro,.c,.cpp,.h,.hpp,.cs,.fs,.vb,.r,.jl,.lua,.m,.mm,.scala,.groovy,.dart,.asm,.s,.elm,.erl,.ex,.exs,.hs,.lhs,.lisp,.clj,.cljs,.cljc,.edn,.ml,.mli,.ps1,.psm1,.psd1,.proto,.graphql,.gql,.bat,.cmd,.awk,.sed,.vim,.emacs,.el,.dockerfile,.dockerignore,.gitignore,.gitattributes,.env,.env.local,.env.development,.env.test,.env.production,.babelrc,.eslintrc,.prettierrc,.stylelintrc,.htaccess,.nginx,.apache2'

  const isDisabled = attachments.length >= MAX_NUMBER_OF_ATTACHMENTS

  return (
    <>
      <ContextMenu
        position={messages.length > 0 ? 'top' : 'bottom'}
        triggerId="clipboard-and-file-menu"
        leftClick={true}
        items={menuItems}
        menuStyle={{ background: '#191919', borderColor: '#222222' }}
        disabled={isDisabled}
      >
        {
          // @ts-ignore
          ({ isOpen }) => (
            <Tooltip
              tooltip={isDisabled ? 'Max number of attahments added' : isOpen ? '' : 'Attach clipboard & files'}
              position={'top'}
            >
              <button
                type="button"
                className={`${styles.button} ${isDisabled ? styles.disabledButton : ''}`}
                id="clipboard-and-file-menu"
              >
                <PaperclipIcon />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onAddFile}
                  accept={acceptTypes}
                  className={styles.hiddenInput}
                  multiple
                />
              </button>
            </Tooltip>
          )
        }
      </ContextMenu>
    </>
  )
}
