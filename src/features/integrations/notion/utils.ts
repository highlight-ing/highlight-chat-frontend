import { NotionParentItem } from '@/types'
import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints'
import type { Block, Decoration, SubDecoration } from 'notion-types'

export function getDecorations(title: RichTextItemResponse[]) {
  return title.map((text) => {
    const subAnnotations: SubDecoration[] = []

    if (text.annotations.bold) {
      subAnnotations.push(['b'])
    }

    if (text.annotations.italic) {
      subAnnotations.push(['i'])
    }

    if (text.annotations.strikethrough) {
      subAnnotations.push(['s'])
    }

    if (text.annotations.code) {
      subAnnotations.push(['c'])
    }

    if (text.annotations.underline) {
      subAnnotations.push(['_'])
    }

    if (
      text.annotations.color &&
      text.annotations.color !== 'green' &&
      text.annotations.color !== 'default' &&
      text.annotations.color !== 'green_background'
    ) {
      subAnnotations.push(['h', text.annotations.color])
    }

    if (subAnnotations.length > 0) {
      return [text.plain_text, ...subAnnotations] as Decoration
    }

    return [text.plain_text] as Decoration
  })
}

export function mapNotionDecorations(items: NotionParentItem[]) {
  return items.map((item) => {
    return {
      ...item,
      decorations: item.title.map((text) => {
        const subAnnotations: SubDecoration[] = []

        if (text.annotations.bold) {
          subAnnotations.push(['b'])
        }

        if (text.annotations.italic) {
          subAnnotations.push(['i'])
        }

        if (text.annotations.strikethrough) {
          subAnnotations.push(['s'])
        }

        if (text.annotations.code) {
          subAnnotations.push(['c'])
        }

        if (text.annotations.underline) {
          subAnnotations.push(['_'])
        }

        if (
          text.annotations.color &&
          text.annotations.color !== 'green' &&
          text.annotations.color !== 'default' &&
          text.annotations.color !== 'green_background'
        ) {
          subAnnotations.push(['h', text.annotations.color])
        }

        if (subAnnotations.length > 0) {
          return [text.plain_text, ...subAnnotations] as Decoration
        }

        return [text.plain_text] as Decoration
      }),
    }
  })
}

export const emptyTextBlock: Block = {
  content: [],
  type: 'text',
  id: '',
  parent_id: '',
  parent_table: '',
  version: 0,
  created_time: 0,
  last_edited_time: 0,
  alive: true,
  created_by_table: '',
  created_by_id: '',
  last_edited_by_table: '',
  last_edited_by_id: '',
}
