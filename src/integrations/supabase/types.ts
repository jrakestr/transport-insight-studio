export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      article_agencies: {
        Row: {
          agency_id: string
          article_id: string
          created_at: string
          id: string
          mention_type: string | null
        }
        Insert: {
          agency_id: string
          article_id: string
          created_at?: string
          id?: string
          mention_type?: string | null
        }
        Update: {
          agency_id?: string
          article_id?: string
          created_at?: string
          id?: string
          mention_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_agencies_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_agencies_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_providers: {
        Row: {
          article_id: string
          created_at: string
          id: string
          mention_type: string | null
          provider_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          mention_type?: string | null
          provider_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          mention_type?: string | null
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_providers_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "transportation_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      article_verticals: {
        Row: {
          article_id: string
          created_at: string
          id: string
          vertical: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          vertical: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          vertical?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_verticals_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_name: string | null
          author_role: string | null
          category: string | null
          content: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          published_at: string
          slug: string
          source_name: string | null
          source_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          slug: string
          source_name?: string | null
          source_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          slug?: string
          source_name?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          agency_id: string | null
          article_id: string | null
          created_at: string
          id: string
          notes: string | null
          provider_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          article_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          provider_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          article_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          provider_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "transportation_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          published_at: string
          read_time: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transit_agencies: {
        Row: {
          created_at: string
          fleet_size: number | null
          formal_name: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          ntd_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          fleet_size?: number | null
          formal_name?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          ntd_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          fleet_size?: number | null
          formal_name?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          ntd_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      transportation_providers: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          provider_type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          provider_type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          provider_type?: string | null
          updated_at?: string
          website?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
