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
      events: {
        Row: {
          created_at: string
          date: string
          id: string
          location: string | null
          name: string
          organizer_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          location?: string | null
          name: string
          organizer_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          location?: string | null
          name?: string
          organizer_id?: string
        }
        Relationships: []
      }
      image_dorsals: {
        Row: {
          confidence: number
          created_at: string
          dorsal_number: string
          id: string
          image_id: string | null
        }
        Insert: {
          confidence: number
          created_at?: string
          dorsal_number: string
          id?: string
          image_id?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          dorsal_number?: string
          id?: string
          image_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_dorsals_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      image_tags: {
        Row: {
          created_at: string | null
          image_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          image_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          image_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_tags_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: true
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          compressed_url: string
          created_at: string
          event_id: string | null
          id: string
          original_url: string
          photographer_id: string
          status: string | null
          tag: string | null
        }
        Insert: {
          compressed_url: string
          created_at?: string
          event_id?: string | null
          id?: string
          original_url: string
          photographer_id: string
          status?: string | null
          tag?: string | null
        }
        Update: {
          compressed_url?: string
          created_at?: string
          event_id?: string | null
          id?: string
          original_url?: string
          photographer_id?: string
          status?: string | null
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number
          buyer_email: string
          created_at: string
          download_expires_at: string | null
          download_url: string | null
          id: string
          image_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          buyer_email: string
          created_at?: string
          download_expires_at?: string | null
          download_url?: string | null
          id?: string
          image_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          buyer_email?: string
          created_at?: string
          download_expires_at?: string | null
          download_url?: string | null
          id?: string
          image_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_tags: {
        Row: {
          created_at: string | null
          tag_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          tag_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth0_id"]
          },
        ]
      }
      users: {
        Row: {
          auth0_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          auth0_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          auth0_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          policy_name: string
          policy_roles: string[]
          cmd: string
          qual: string
          with_check: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
