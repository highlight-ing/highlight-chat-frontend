export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      added_prompt_tags: {
        Row: {
          created_at: string
          id: number
          prompt_id: number | null
          tag_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          prompt_id?: number | null
          tag_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          prompt_id?: number | null
          tag_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "added_tags_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "added_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
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
            foreignKeyName: "added_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      app_icons: {
        Row: {
          app_icon: string
          app_name: string
          created_at: string
          external_id: string
          id: number
        }
        Insert: {
          app_icon: string
          app_name: string
          created_at?: string
          external_id?: string
          id?: number
        }
        Update: {
          app_icon?: string
          app_name?: string
          created_at?: string
          external_id?: string
          id?: number
        }
        Relationships: []
      }
      app_shortcut_preferences: {
        Row: {
          application_name_darwin: string | null
          application_name_win32: string | null
          created_at: string
          id: number
          prompt_id: number
          user_id: string
        }
        Insert: {
          application_name_darwin?: string | null
          application_name_win32?: string | null
          created_at?: string 
          id?: number
          prompt_id: number
          user_id: string
        }
        Update: {
          application_name_darwin?: string | null
          application_name_win32?: string | null
          created_at?: string
          id?: number
          prompt_id?: number
          user_id?: string
        }
        Relationships: []
      }
      conversation: {
        Row: {
          app_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
          version: string | null
        }
        Insert: {
          app_id?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          version?: string | null
        }
        Update: {
          app_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          version?: string | null
        }
        Relationships: []
      }
      encrypted_messages: {
        Row: {
          conversation_id: string
          created_at: string
          encrypted_content: string
          file_ids: string[] | null
          id: string
          image_url: string | null
          role: string
          user_id: string
        }
        Insert: {
          conversation_id?: string
          created_at?: string
          encrypted_content: string
          file_ids?: string[] | null
          id?: string
          image_url?: string | null
          role: string
          user_id?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          encrypted_content?: string
          file_ids?: string[] | null
          id?: string
          image_url?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          conversation_id: string
          created_at: string
          external_id: string
          feedback: string | null
          feedback_type: string
          id: number
          message_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id?: string
          created_at?: string
          external_id?: string
          feedback?: string | null
          feedback_type?: string
          id?: number
          message_id?: string
          rating: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          external_id?: string
          feedback?: string | null
          feedback_type?: string
          id?: number
          message_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "encrypted_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      file_metadata: {
        Row: {
          conversation_id: string | null
          created_at: string
          file_id: string | null
          file_type: string | null
          id: string
          storage_provider: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          file_id?: string | null
          file_type?: string | null
          id?: string
          storage_provider?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          file_id?: string | null
          file_type?: string | null
          id?: string
          storage_provider?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      follow_up_feedback: {
        Row: {
          created_at: string
          follow_up_shown: boolean
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          follow_up_shown?: boolean
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          follow_up_shown?: boolean
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      message: {
        Row: {
          audio: string | null
          clipboard_text: string | null
          content: string | null
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
          content?: string | null
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
          content?: string | null
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
            foreignKeyName: "message_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          added_default_prompts: boolean | null
          created_at: string
          id: number
          user_id: string
          username: string | null
        }
        Insert: {
          added_default_prompts?: boolean | null
          created_at?: string
          id?: number
          user_id: string
          username?: string | null
        }
        Update: {
          added_default_prompts?: boolean | null
          created_at?: string
          id?: number
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      prompt_page_trending: {
        Row: {
          created_at: string
          id: number
          prompt_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          prompt_id: number
        }
        Update: {
          created_at?: string
          id?: number
          prompt_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_page_trending_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_usages: {
        Row: {
          created_at: string
          id: number
          prompt_id: number
          user_id: string | null
          was_processed: boolean
        }
        Insert: {
          created_at?: string
          id?: number
          prompt_id: number
          user_id?: string | null
          was_processed?: boolean
        }
        Update: {
          created_at?: string
          id?: number
          prompt_id?: number
          user_id?: string | null
          was_processed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "prompt_usages_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          can_trend: boolean | null
          canShowOnPromptPage: boolean
          create_gcal_event_integration_enabled: boolean | null
          create_notion_page_integration_enabled: boolean | null
          created_at: string
          description: string | null
          email_integration_enabled: boolean | null
          enable_agent_mode: boolean
          external_id: string
          id: number
          image: string | null
          is_handlebar_prompt: boolean
          linear_integration_enabled: boolean | null
          name: string
          preferred_attachment: string | null
          prompt_text: string | null
          prompt_url: string | null
          public: boolean
          public_use_number: number
          roleplay: boolean | null
          send_slack_message_integration_enabled: boolean | null
          slug: string
          suggestion_prompt_text: string | null
          system_prompt: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          can_trend?: boolean | null
          canShowOnPromptPage?: boolean
          create_gcal_event_integration_enabled?: boolean | null
          create_notion_page_integration_enabled?: boolean | null
          created_at?: string
          description?: string | null
          email_integration_enabled?: boolean | null
          enable_agent_mode?: boolean
          external_id?: string
          id?: number
          image?: string | null
          is_handlebar_prompt?: boolean
          linear_integration_enabled?: boolean | null
          name: string
          preferred_attachment?: string | null
          prompt_text?: string | null
          prompt_url?: string | null
          public?: boolean
          public_use_number?: number
          roleplay?: boolean | null
          send_slack_message_integration_enabled?: boolean | null
          slug: string
          suggestion_prompt_text?: string | null
          system_prompt?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          can_trend?: boolean | null
          canShowOnPromptPage?: boolean
          create_gcal_event_integration_enabled?: boolean | null
          create_notion_page_integration_enabled?: boolean | null
          created_at?: string
          description?: string | null
          email_integration_enabled?: boolean | null
          enable_agent_mode?: boolean
          external_id?: string
          id?: number
          image?: string | null
          is_handlebar_prompt?: boolean
          linear_integration_enabled?: boolean | null
          name?: string
          preferred_attachment?: string | null
          prompt_text?: string | null
          prompt_url?: string | null
          public?: boolean
          public_use_number?: number
          roleplay?: boolean | null
          send_slack_message_integration_enabled?: boolean | null
          slug?: string
          suggestion_prompt_text?: string | null
          system_prompt?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_image_fkey"
            columns: ["image"]
            isOneToOne: false
            referencedRelation: "user_images"
            referencedColumns: ["external_id"]
          },
        ]
      }
      shared_conversation_messages: {
        Row: {
          attached_context: Json[] | null
          audio: string | null
          available_context: Json[] | null
          clipboard_text: string | null
          content: string | null
          context: string | null
          conversation_id: string
          created_at: string
          file_ids: string[] | null
          id: number
          image_url: string | null
          ocr_text: string | null
          role: string
          text_file: string | null
          window_context: string | null
          windows: string[] | null
        }
        Insert: {
          attached_context?: Json[] | null
          audio?: string | null
          available_context?: Json[] | null
          clipboard_text?: string | null
          content?: string | null
          context?: string | null
          conversation_id?: string
          created_at?: string
          file_ids?: string[] | null
          id?: number
          image_url?: string | null
          ocr_text?: string | null
          role: string
          text_file?: string | null
          window_context?: string | null
          windows?: string[] | null
        }
        Update: {
          attached_context?: Json[] | null
          audio?: string | null
          available_context?: Json[] | null
          clipboard_text?: string | null
          content?: string | null
          context?: string | null
          conversation_id?: string
          created_at?: string
          file_ids?: string[] | null
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
            foreignKeyName: "shared_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "shared_conversations"
            referencedColumns: ["id"]
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
            foreignKeyName: "shared_conversations_original_conversation_id_fkey"
            columns: ["original_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          external_id: string
          id: number
          slug: string
          tag: string
        }
        Insert: {
          created_at?: string
          external_id?: string
          id?: number
          slug: string
          tag: string
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: number
          slug?: string
          tag?: string
        }
        Relationships: []
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
      boost_marks_prompts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      bulk_update_prompt_usages: {
        Args: {
          ids: number[]
          public_use_numbers: number[]
        }
        Returns: undefined
      }
      get_conversations_with_files: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          user_id: string
          title: string
          app_id: string
          created_at: string
          updated_at: string
          file_id: string
          file_type: string
        }[]
      }
      get_conversations_with_shared:
        | {
            Args: {
              p_user_id: string
            }
            Returns: {
              id: string
              user_id: string
              title: string
              created_at: string
              updated_at: string
              app_id: string
              shared_id: string
              shared_created_at: string
              shared_title: string
            }[]
          }
        | {
            Args: {
              p_user_id: string
            }
            Returns: {
              id: string
              user_id: string
              title: string
              created_at: string
              updated_at: string
              app_id: string
              shared_id: string
              shared_created_at: string
              shared_title: string
            }[]
          }
      get_conversations_with_shared_v2:
        | {
            Args: {
              p_user_id: string
            }
            Returns: {
              id: string
              user_id: string
              title: string
              created_at: string
              updated_at: string
              app_id: string
              shared_id: string
              shared_created_at: string
              shared_title: string
            }[]
          }
        | {
            Args: {
              p_user_id: string
            }
            Returns: {
              id: string
              user_id: string
              title: string
              created_at: string
              updated_at: string
              app_id: string
              shared_id: string
              shared_created_at: string
              shared_title: string
            }[]
          }
      get_conversations_with_shared_v3: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          app_id: string
          shared_id: string
          shared_created_at: string
          shared_title: string
        }[]
      }
      get_conversations_with_shared_v4: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          app_id: string
          shared_id: string
          shared_created_at: string
          shared_title: string
        }[]
      }
      get_prompt_tags: {
        Args: {
          p_external_id: string
        }
        Returns: {
          tag: string
        }[]
      }
      get_related_prompts: {
        Args: {
          p_prompt_id: number
        }
        Returns: {
          related_prompt_id: number
          related_prompt_name: string
          related_prompt_slug: string
        }[]
      }
      get_top_6_prompts_by_tag: {
        Args: {
          tag_name: string
        }
        Returns: {
          id: number
        }[]
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      search_prompts: {
        Args: {
          query: string
          tags: string[]
        }
        Returns: {
          id: number
          name: string
          description: string
          tag: string
        }[]
      }
      search_prompts_fuzzy: {
        Args: {
          query: string
        }
        Returns: {
          id: number
        }[]
      }
      select_top_6_tags: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          tag: string
          tag_count: number
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      set_mark_can_trend: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      top_tags_selection: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          tag: string
          tag_count: number
        }[]
      }
    }
    Enums: {
      HLChatDBAttachment: "screenshot" | "voice" | "clipboard" | "ocr"
      HLChatPromptTags: "value" | "label"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
