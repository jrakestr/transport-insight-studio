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
      article_categories: {
        Row: {
          article_id: string
          category: string
          created_at: string
          id: string
        }
        Insert: {
          article_id: string
          category: string
          created_at?: string
          id?: string
        }
        Update: {
          article_id?: string
          category?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_categories_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_processing_status: {
        Row: {
          article_id: string
          created_at: string | null
          error_message: string | null
          id: string
          last_processed_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_processed_at?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_processed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_processing_status_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
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
          document_file_path: string | null
          document_url: string | null
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
          document_file_path?: string | null
          document_url?: string | null
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
          document_file_path?: string | null
          document_url?: string | null
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
      playbooks: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          order_index: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          order_index?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          order_index?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          address_line_1: string | null
          address_line_2: string | null
          agency_name: string
          city: string | null
          created_at: string
          density: number | null
          division_department: string | null
          doing_business_as: string | null
          doing_business_as_old: string | null
          fta_recipient_id: string | null
          fy_end_date: string | null
          id: string
          legacy_ntd_id: string | null
          notes: string | null
          ntd_id: string | null
          organization_type: string | null
          original_due_date: string | null
          personal_vehicles: number | null
          population: number | null
          primary_uza_uace_code: string | null
          region: string | null
          reported_by_name: string | null
          reported_by_ntd_id: string | null
          reporter_acronym: string | null
          reporter_type: string | null
          reporting_module: string | null
          service_area_pop: number | null
          service_area_sq_miles: number | null
          sq_miles: number | null
          state: string | null
          state_parent_ntd_id: string | null
          subrecipient_type: string | null
          tam_tier: string | null
          total_voms: number | null
          ueid: string | null
          updated_at: string
          url: string | null
          uza_name: string | null
          volunteer_drivers: number | null
          voms_do: number | null
          voms_pt: number | null
          zip_code: string | null
          zip_code_ext: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          agency_name: string
          city?: string | null
          created_at?: string
          density?: number | null
          division_department?: string | null
          doing_business_as?: string | null
          doing_business_as_old?: string | null
          fta_recipient_id?: string | null
          fy_end_date?: string | null
          id?: string
          legacy_ntd_id?: string | null
          notes?: string | null
          ntd_id?: string | null
          organization_type?: string | null
          original_due_date?: string | null
          personal_vehicles?: number | null
          population?: number | null
          primary_uza_uace_code?: string | null
          region?: string | null
          reported_by_name?: string | null
          reported_by_ntd_id?: string | null
          reporter_acronym?: string | null
          reporter_type?: string | null
          reporting_module?: string | null
          service_area_pop?: number | null
          service_area_sq_miles?: number | null
          sq_miles?: number | null
          state?: string | null
          state_parent_ntd_id?: string | null
          subrecipient_type?: string | null
          tam_tier?: string | null
          total_voms?: number | null
          ueid?: string | null
          updated_at?: string
          url?: string | null
          uza_name?: string | null
          volunteer_drivers?: number | null
          voms_do?: number | null
          voms_pt?: number | null
          zip_code?: string | null
          zip_code_ext?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          agency_name?: string
          city?: string | null
          created_at?: string
          density?: number | null
          division_department?: string | null
          doing_business_as?: string | null
          doing_business_as_old?: string | null
          fta_recipient_id?: string | null
          fy_end_date?: string | null
          id?: string
          legacy_ntd_id?: string | null
          notes?: string | null
          ntd_id?: string | null
          organization_type?: string | null
          original_due_date?: string | null
          personal_vehicles?: number | null
          population?: number | null
          primary_uza_uace_code?: string | null
          region?: string | null
          reported_by_name?: string | null
          reported_by_ntd_id?: string | null
          reporter_acronym?: string | null
          reporter_type?: string | null
          reporting_module?: string | null
          service_area_pop?: number | null
          service_area_sq_miles?: number | null
          sq_miles?: number | null
          state?: string | null
          state_parent_ntd_id?: string | null
          subrecipient_type?: string | null
          tam_tier?: string | null
          total_voms?: number | null
          ueid?: string | null
          updated_at?: string
          url?: string | null
          uza_name?: string | null
          volunteer_drivers?: number | null
          voms_do?: number | null
          voms_pt?: number | null
          zip_code?: string | null
          zip_code_ext?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
