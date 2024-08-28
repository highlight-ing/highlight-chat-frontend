export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      added_prompts: {
        Row: {
          created_at: string
          id: number
          prompt_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          prompt_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          prompt_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'added_prompts_prompt_id_fkey'
            columns: ['prompt_id']
            isOneToOne: false
            referencedRelation: 'prompts'
            referencedColumns: ['id']
          },
        ]
      }
      conversation: {
        Row: {
          app_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_id?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      image_data: {
        Row: {
          base64_image: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          base64_image: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          base64_image?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      message: {
        Row: {
          audio: string | null
          clipboard_text: string | null
          content: string
          context: string | null
          conversation_id: string
          created_at: string
          id: number
          image_url: string | null
          ocr_text: string | null
          pdf_chunks: string | null
          role: string
          text_file: string | null
          user_id: string
          window_context: string | null
          windows: string[] | null
        }
        Insert: {
          audio?: string | null
          clipboard_text?: string | null
          content: string
          context?: string | null
          conversation_id?: string
          created_at?: string
          id?: number
          image_url?: string | null
          ocr_text?: string | null
          pdf_chunks?: string | null
          role: string
          text_file?: string | null
          user_id: string
          window_context?: string | null
          windows?: string[] | null
        }
        Update: {
          audio?: string | null
          clipboard_text?: string | null
          content?: string
          context?: string | null
          conversation_id?: string
          created_at?: string
          id?: number
          image_url?: string | null
          ocr_text?: string | null
          pdf_chunks?: string | null
          role?: string
          text_file?: string | null
          user_id?: string
          window_context?: string | null
          windows?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'message_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversation'
            referencedColumns: ['id']
          },
        ]
      }
      prompt_usages: {
        Row: {
          created_at: string
          id: number
          prompt_id: number
          was_processed: boolean
        }
        Insert: {
          created_at?: string
          id?: number
          prompt_id: number
          was_processed?: boolean
        }
        Update: {
          created_at?: string
          id?: number
          prompt_id?: number
          was_processed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'prompt_usages_prompt_id_fkey'
            columns: ['prompt_id']
            isOneToOne: false
            referencedRelation: 'prompts'
            referencedColumns: ['id']
          },
        ]
      }
      prompts: {
        Row: {
          created_at: string
          description: string | null
          external_id: string
          id: number
          image: string | null
          is_handlebar_prompt: boolean
          name: string
          prompt_text: string | null
          prompt_url: string | null
          public: boolean
          public_use_number: number
          slug: string
          suggestion_prompt_text: string | null
          tags: string[] | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_id?: string
          id?: number
          image?: string | null
          is_handlebar_prompt?: boolean
          name: string
          prompt_text?: string | null
          prompt_url?: string | null
          public?: boolean
          public_use_number?: number
          slug: string
          suggestion_prompt_text?: string | null
          tags?: string[] | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          external_id?: string
          id?: number
          image?: string | null
          is_handlebar_prompt?: boolean
          name?: string
          prompt_text?: string | null
          prompt_url?: string | null
          public?: boolean
          public_use_number?: number
          slug?: string
          suggestion_prompt_text?: string | null
          tags?: string[] | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'prompts_image_fkey'
            columns: ['image']
            isOneToOne: false
            referencedRelation: 'user_images'
            referencedColumns: ['external_id']
          },
        ]
      }
      shared_conversation_messages: {
        Row: {
          audio: string | null
          clipboard_text: string | null
          content: string
          context: string | null
          conversation_id: string
          created_at: string
          id: number
          image_url: string | null
          ocr_text: string | null
          role: string
          text_file: string | null
          window_context: string | null
          windows: string[] | null
        }
        Insert: {
          audio?: string | null
          clipboard_text?: string | null
          content: string
          context?: string | null
          conversation_id?: string
          created_at?: string
          id?: number
          image_url?: string | null
          ocr_text?: string | null
          role: string
          text_file?: string | null
          window_context?: string | null
          windows?: string[] | null
        }
        Update: {
          audio?: string | null
          clipboard_text?: string | null
          content?: string
          context?: string | null
          conversation_id?: string
          created_at?: string
          id?: number
          image_url?: string | null
          ocr_text?: string | null
          role?: string
          text_file?: string | null
          window_context?: string | null
          windows?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'shared_conversation_messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'shared_conversations'
            referencedColumns: ['id']
          },
        ]
      }
      shared_conversations: {
        Row: {
          app_id: string | null
          created_at: string
          id: string
          original_conversation_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          app_id?: string | null
          created_at?: string
          id?: string
          original_conversation_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          app_id?: string | null
          created_at?: string
          id?: string
          original_conversation_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'shared_conversations_original_conversation_id_fkey'
            columns: ['original_conversation_id']
            isOneToOne: false
            referencedRelation: 'conversation'
            referencedColumns: ['id']
          },
        ]
      }
      user_images: {
        Row: {
          created_at: string
          external_id: string
          file_extension: string
          id: number
          public: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          external_id?: string
          file_extension: string
          id?: number
          public?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          external_id?: string
          file_extension?: string
          id?: number
          public?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      HLChatDBAttachment: 'screenshot' | 'voice' | 'clipboard' | 'ocr'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
