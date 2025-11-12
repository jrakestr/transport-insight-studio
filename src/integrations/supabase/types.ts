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
      agency_contractors: {
        Row: {
          agency_id: string
          agency_name: string | null
          buyer_provides_maintenance_facility_to_seller: boolean | null
          buyer_supplies_vehicles_to_seller: boolean | null
          contract_capital_leasing_expenses: number | null
          contractee_agency_id: string | null
          contractee_ntd_id: string | null
          contractee_operator_name: string | null
          created_at: string
          direct_payment_agency_subsidy: number | null
          fares_retained_by: string | null
          id: string
          mode: string | null
          months_seller_operated_in_fy: number | null
          ntd_id: string | null
          other_operating_expenses_incurred_by_the_buyer: number | null
          other_party: string | null
          other_public_assets_provided: boolean | null
          other_public_assets_provided_desc: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer: number | null
          passenger_out_of_pocket_expenses: number | null
          primary_feature: string | null
          pt_fare_revenues_passenger_fees: number | null
          reporter_contractual_position: string | null
          reporter_type: string | null
          reporting_module: string | null
          service_captured: string | null
          tos: string | null
          total_modal_expenses: number | null
          type_of_contract: string | null
          updated_at: string
          voms_under_contract: number | null
        }
        Insert: {
          agency_id: string
          agency_name?: string | null
          buyer_provides_maintenance_facility_to_seller?: boolean | null
          buyer_supplies_vehicles_to_seller?: boolean | null
          contract_capital_leasing_expenses?: number | null
          contractee_agency_id?: string | null
          contractee_ntd_id?: string | null
          contractee_operator_name?: string | null
          created_at?: string
          direct_payment_agency_subsidy?: number | null
          fares_retained_by?: string | null
          id?: string
          mode?: string | null
          months_seller_operated_in_fy?: number | null
          ntd_id?: string | null
          other_operating_expenses_incurred_by_the_buyer?: number | null
          other_party?: string | null
          other_public_assets_provided?: boolean | null
          other_public_assets_provided_desc?: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer?: number | null
          passenger_out_of_pocket_expenses?: number | null
          primary_feature?: string | null
          pt_fare_revenues_passenger_fees?: number | null
          reporter_contractual_position?: string | null
          reporter_type?: string | null
          reporting_module?: string | null
          service_captured?: string | null
          tos?: string | null
          total_modal_expenses?: number | null
          type_of_contract?: string | null
          updated_at?: string
          voms_under_contract?: number | null
        }
        Update: {
          agency_id?: string
          agency_name?: string | null
          buyer_provides_maintenance_facility_to_seller?: boolean | null
          buyer_supplies_vehicles_to_seller?: boolean | null
          contract_capital_leasing_expenses?: number | null
          contractee_agency_id?: string | null
          contractee_ntd_id?: string | null
          contractee_operator_name?: string | null
          created_at?: string
          direct_payment_agency_subsidy?: number | null
          fares_retained_by?: string | null
          id?: string
          mode?: string | null
          months_seller_operated_in_fy?: number | null
          ntd_id?: string | null
          other_operating_expenses_incurred_by_the_buyer?: number | null
          other_party?: string | null
          other_public_assets_provided?: boolean | null
          other_public_assets_provided_desc?: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer?: number | null
          passenger_out_of_pocket_expenses?: number | null
          primary_feature?: string | null
          pt_fare_revenues_passenger_fees?: number | null
          reporter_contractual_position?: string | null
          reporter_type?: string | null
          reporting_module?: string | null
          service_captured?: string | null
          tos?: string | null
          total_modal_expenses?: number | null
          type_of_contract?: string | null
          updated_at?: string
          voms_under_contract?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_contractors_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_contractors_contractee_agency_id_fkey"
            columns: ["contractee_agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_performance_metrics: {
        Row: {
          agency: string | null
          agency_id: string | null
          agency_name: string | null
          agency_voms: number | null
          buyer_provides_maintenance_facility_to_seller: string | null
          buyer_supplies_vehicles_to_seller: string | null
          city: string | null
          contract_capital_leasing_expenses: number | null
          contractee_agency_id: string | null
          contractee_ntd_id: string | null
          contractee_operator_name: string | null
          cost_per_hour: number | null
          cost_per_hour_questionable: string | null
          cost_per_passenger: number | null
          cost_per_passenger_1: number | null
          cost_per_passenger_mile: number | null
          cost_per_passenger_mile_1: number | null
          created_at: string
          direct_payment_agency_subsidy: number | null
          fare_revenues_earned: number | null
          fare_revenues_earned_1: number | null
          fare_revenues_per_total: number | null
          fare_revenues_per_total_1: number | null
          fare_revenues_per_unlinked: number | null
          fare_revenues_per_unlinked_1: number | null
          fares_retained_by: string | null
          id: string
          mode: string | null
          mode_contract: string | null
          mode_name: string | null
          mode_voms: number | null
          months_seller_operated_in_fy: number | null
          ntd_id: string | null
          ntd_id_contract: string | null
          organization_type: string | null
          other_operating_expenses_incurred_by_the_buyer: number | null
          other_party: string | null
          other_public_assets_provided: string | null
          other_public_assets_provided_desc: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer: number | null
          passenger_miles: number | null
          passenger_miles_questionable: string | null
          passenger_out_of_pocket_expenses: number | null
          passengers_per_hour: number | null
          passengers_per_hour_1: number | null
          primary_feature: string | null
          primary_uza_population: number | null
          pt_fare_revenues_passenger_fees: number | null
          report_year: number | null
          reporter_contractual_position: string | null
          reporter_type: string | null
          reporter_type_contract: string | null
          reporting_module: string | null
          service_captured: string | null
          state: string | null
          tos: string | null
          total_modal_expenses: number | null
          total_operating_expenses: number | null
          total_operating_expenses_1: number | null
          type_of_contract: string | null
          type_of_service: string | null
          uace_code: string | null
          unlinked_passenger_trips: number | null
          unlinked_passenger_trips_1: number | null
          updated_at: string
          uza_name: string | null
          vehicle_revenue_hours: number | null
          vehicle_revenue_hours_1: number | null
          vehicle_revenue_miles: number | null
          vehicle_revenue_miles_1: number | null
          voms_under_contract: number | null
        }
        Insert: {
          agency?: string | null
          agency_id?: string | null
          agency_name?: string | null
          agency_voms?: number | null
          buyer_provides_maintenance_facility_to_seller?: string | null
          buyer_supplies_vehicles_to_seller?: string | null
          city?: string | null
          contract_capital_leasing_expenses?: number | null
          contractee_agency_id?: string | null
          contractee_ntd_id?: string | null
          contractee_operator_name?: string | null
          cost_per_hour?: number | null
          cost_per_hour_questionable?: string | null
          cost_per_passenger?: number | null
          cost_per_passenger_1?: number | null
          cost_per_passenger_mile?: number | null
          cost_per_passenger_mile_1?: number | null
          created_at?: string
          direct_payment_agency_subsidy?: number | null
          fare_revenues_earned?: number | null
          fare_revenues_earned_1?: number | null
          fare_revenues_per_total?: number | null
          fare_revenues_per_total_1?: number | null
          fare_revenues_per_unlinked?: number | null
          fare_revenues_per_unlinked_1?: number | null
          fares_retained_by?: string | null
          id?: string
          mode?: string | null
          mode_contract?: string | null
          mode_name?: string | null
          mode_voms?: number | null
          months_seller_operated_in_fy?: number | null
          ntd_id?: string | null
          ntd_id_contract?: string | null
          organization_type?: string | null
          other_operating_expenses_incurred_by_the_buyer?: number | null
          other_party?: string | null
          other_public_assets_provided?: string | null
          other_public_assets_provided_desc?: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer?: number | null
          passenger_miles?: number | null
          passenger_miles_questionable?: string | null
          passenger_out_of_pocket_expenses?: number | null
          passengers_per_hour?: number | null
          passengers_per_hour_1?: number | null
          primary_feature?: string | null
          primary_uza_population?: number | null
          pt_fare_revenues_passenger_fees?: number | null
          report_year?: number | null
          reporter_contractual_position?: string | null
          reporter_type?: string | null
          reporter_type_contract?: string | null
          reporting_module?: string | null
          service_captured?: string | null
          state?: string | null
          tos?: string | null
          total_modal_expenses?: number | null
          total_operating_expenses?: number | null
          total_operating_expenses_1?: number | null
          type_of_contract?: string | null
          type_of_service?: string | null
          uace_code?: string | null
          unlinked_passenger_trips?: number | null
          unlinked_passenger_trips_1?: number | null
          updated_at?: string
          uza_name?: string | null
          vehicle_revenue_hours?: number | null
          vehicle_revenue_hours_1?: number | null
          vehicle_revenue_miles?: number | null
          vehicle_revenue_miles_1?: number | null
          voms_under_contract?: number | null
        }
        Update: {
          agency?: string | null
          agency_id?: string | null
          agency_name?: string | null
          agency_voms?: number | null
          buyer_provides_maintenance_facility_to_seller?: string | null
          buyer_supplies_vehicles_to_seller?: string | null
          city?: string | null
          contract_capital_leasing_expenses?: number | null
          contractee_agency_id?: string | null
          contractee_ntd_id?: string | null
          contractee_operator_name?: string | null
          cost_per_hour?: number | null
          cost_per_hour_questionable?: string | null
          cost_per_passenger?: number | null
          cost_per_passenger_1?: number | null
          cost_per_passenger_mile?: number | null
          cost_per_passenger_mile_1?: number | null
          created_at?: string
          direct_payment_agency_subsidy?: number | null
          fare_revenues_earned?: number | null
          fare_revenues_earned_1?: number | null
          fare_revenues_per_total?: number | null
          fare_revenues_per_total_1?: number | null
          fare_revenues_per_unlinked?: number | null
          fare_revenues_per_unlinked_1?: number | null
          fares_retained_by?: string | null
          id?: string
          mode?: string | null
          mode_contract?: string | null
          mode_name?: string | null
          mode_voms?: number | null
          months_seller_operated_in_fy?: number | null
          ntd_id?: string | null
          ntd_id_contract?: string | null
          organization_type?: string | null
          other_operating_expenses_incurred_by_the_buyer?: number | null
          other_party?: string | null
          other_public_assets_provided?: string | null
          other_public_assets_provided_desc?: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer?: number | null
          passenger_miles?: number | null
          passenger_miles_questionable?: string | null
          passenger_out_of_pocket_expenses?: number | null
          passengers_per_hour?: number | null
          passengers_per_hour_1?: number | null
          primary_feature?: string | null
          primary_uza_population?: number | null
          pt_fare_revenues_passenger_fees?: number | null
          report_year?: number | null
          reporter_contractual_position?: string | null
          reporter_type?: string | null
          reporter_type_contract?: string | null
          reporting_module?: string | null
          service_captured?: string | null
          state?: string | null
          tos?: string | null
          total_modal_expenses?: number | null
          total_operating_expenses?: number | null
          total_operating_expenses_1?: number | null
          type_of_contract?: string | null
          type_of_service?: string | null
          uace_code?: string | null
          unlinked_passenger_trips?: number | null
          unlinked_passenger_trips_1?: number | null
          updated_at?: string
          uza_name?: string | null
          vehicle_revenue_hours?: number | null
          vehicle_revenue_hours_1?: number | null
          vehicle_revenue_miles?: number | null
          vehicle_revenue_miles_1?: number | null
          voms_under_contract?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_performance_metrics_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
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
      discovery_runs: {
        Row: {
          articles_added: number | null
          articles_discovered: number | null
          articles_processed: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          run_metadata: Json | null
          started_at: string
          status: string
        }
        Insert: {
          articles_added?: number | null
          articles_discovered?: number | null
          articles_processed?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          run_metadata?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          articles_added?: number | null
          articles_discovered?: number | null
          articles_processed?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          run_metadata?: Json | null
          started_at?: string
          status?: string
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
      pending_articles: {
        Row: {
          ai_analysis: Json | null
          ai_confidence_score: number | null
          author_name: string | null
          author_role: string | null
          content: string | null
          created_at: string
          description: string | null
          discovered_at: string
          discovery_method: string | null
          extracted_agencies: Json | null
          extracted_category: string | null
          extracted_opportunities: Json | null
          extracted_providers: Json | null
          extracted_verticals: string[] | null
          id: string
          image_url: string | null
          published_article_id: string | null
          published_at: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          source_name: string | null
          source_url: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_confidence_score?: number | null
          author_name?: string | null
          author_role?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          discovered_at?: string
          discovery_method?: string | null
          extracted_agencies?: Json | null
          extracted_category?: string | null
          extracted_opportunities?: Json | null
          extracted_providers?: Json | null
          extracted_verticals?: string[] | null
          id?: string
          image_url?: string | null
          published_article_id?: string | null
          published_at?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          source_name?: string | null
          source_url: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_confidence_score?: number | null
          author_name?: string | null
          author_role?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          discovered_at?: string
          discovery_method?: string | null
          extracted_agencies?: Json | null
          extracted_category?: string | null
          extracted_opportunities?: Json | null
          extracted_providers?: Json | null
          extracted_verticals?: string[] | null
          id?: string
          image_url?: string | null
          published_article_id?: string | null
          published_at?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          source_name?: string | null
          source_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_articles_published_article_id_fkey"
            columns: ["published_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
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
