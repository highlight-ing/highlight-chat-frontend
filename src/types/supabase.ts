export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
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
          role: string
          user_id: string
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
          user_id: string
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
          user_id?: string
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
      prompts: {
        Row: {
          created_at: string
          description: string | null
          external_id: string
          id: number
          name: string
          prompt_text: string | null
          prompt_url: string | null
          public: boolean
          slug: string | null
          suggestion_prompt_text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_id?: string
          id?: number
          name: string
          prompt_text?: string | null
          prompt_url?: string | null
          public?: boolean
          slug?: string | null
          suggestion_prompt_text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_id?: string
          id?: number
          name?: string
          prompt_text?: string | null
          prompt_url?: string | null
          public?: boolean
          slug?: string | null
          suggestion_prompt_text?: string | null
          user_id?: string
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
