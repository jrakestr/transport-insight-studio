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
      agency_contacts: {
        Row: {
          agency_id: string
          created_at: string
          department: string | null
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          job_title: string | null
          last_contacted_at: string | null
          last_name: string
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          salesforce_id: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          job_title?: string | null
          last_contacted_at?: string | null
          last_name: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          salesforce_id?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          job_title?: string | null
          last_contacted_at?: string | null
          last_name?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          salesforce_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_contacts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_intelligence: {
        Row: {
          agency_id: string
          confidence_score: number | null
          content: string | null
          created_at: string
          extracted_data: Json | null
          id: string
          intelligence_type: string
          is_verified: boolean | null
          scraped_at: string
          source_url: string
          title: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          agency_id: string
          confidence_score?: number | null
          content?: string | null
          created_at?: string
          extracted_data?: Json | null
          id?: string
          intelligence_type: string
          is_verified?: boolean | null
          scraped_at?: string
          source_url: string
          title?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          agency_id?: string
          confidence_score?: number | null
          content?: string | null
          created_at?: string
          extracted_data?: Json | null
          id?: string
          intelligence_type?: string
          is_verified?: boolean | null
          scraped_at?: string
          source_url?: string
          title?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_intelligence_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_software: {
        Row: {
          agency_id: string
          annual_cost: number | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          id: string
          implementation_status: string | null
          notes: string | null
          software_id: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          annual_cost?: number | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          implementation_status?: string | null
          notes?: string | null
          software_id: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          annual_cost?: number | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          implementation_status?: string | null
          notes?: string | null
          software_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_software_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_software_software_id_fkey"
            columns: ["software_id"]
            isOneToOne: false
            referencedRelation: "software_providers"
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
            referencedRelation: "service_providers"
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
      automated_searches: {
        Row: {
          agency_id: string | null
          created_at: string | null
          created_by: string | null
          failed_runs: number | null
          frequency: string
          id: string
          is_active: boolean | null
          last_error: string | null
          last_run_at: string | null
          next_run_at: string | null
          notes: string | null
          priority: string
          provider_id: string | null
          results_count: number | null
          search_parameters: Json | null
          search_query: string
          search_type: string
          successful_runs: number | null
          tags: string[] | null
          total_runs: number | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          created_by?: string | null
          failed_runs?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_run_at?: string | null
          next_run_at?: string | null
          notes?: string | null
          priority?: string
          provider_id?: string | null
          results_count?: number | null
          search_parameters?: Json | null
          search_query: string
          search_type: string
          successful_runs?: number | null
          tags?: string[] | null
          total_runs?: number | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          created_by?: string | null
          failed_runs?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_run_at?: string | null
          next_run_at?: string | null
          notes?: string | null
          priority?: string
          provider_id?: string | null
          results_count?: number | null
          search_parameters?: Json | null
          search_query?: string
          search_type?: string
          successful_runs?: number | null
          tags?: string[] | null
          total_runs?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_searches_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_searches_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
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
      implementation_tasks: {
        Row: {
          acceptance_criteria: string[] | null
          actual_hours: number | null
          assigned_to: string | null
          blocks: string[] | null
          category: string
          commit_hash: string | null
          completed_at: string | null
          completed_by: string | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          depends_on: string[] | null
          description: string | null
          due_date: string | null
          edge_function_name: string | null
          estimated_hours: number | null
          file_paths: string[] | null
          id: string
          migration_required: boolean | null
          notes: string | null
          phase: string
          phase_order: number
          priority: string
          project_name: string
          pull_request_url: string | null
          related_entity_id: string | null
          related_table: string | null
          started_at: string | null
          status: string
          task_number: string
          test_status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acceptance_criteria?: string[] | null
          actual_hours?: number | null
          assigned_to?: string | null
          blocks?: string[] | null
          category: string
          commit_hash?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          depends_on?: string[] | null
          description?: string | null
          due_date?: string | null
          edge_function_name?: string | null
          estimated_hours?: number | null
          file_paths?: string[] | null
          id?: string
          migration_required?: boolean | null
          notes?: string | null
          phase: string
          phase_order: number
          priority?: string
          project_name?: string
          pull_request_url?: string | null
          related_entity_id?: string | null
          related_table?: string | null
          started_at?: string | null
          status?: string
          task_number: string
          test_status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acceptance_criteria?: string[] | null
          actual_hours?: number | null
          assigned_to?: string | null
          blocks?: string[] | null
          category?: string
          commit_hash?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          depends_on?: string[] | null
          description?: string | null
          due_date?: string | null
          edge_function_name?: string | null
          estimated_hours?: number | null
          file_paths?: string[] | null
          id?: string
          migration_required?: boolean | null
          notes?: string | null
          phase?: string
          phase_order?: number
          priority?: string
          project_name?: string
          pull_request_url?: string | null
          related_entity_id?: string | null
          related_table?: string | null
          started_at?: string | null
          status?: string
          task_number?: string
          test_status?: string | null
          title?: string
          updated_at?: string | null
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
            referencedRelation: "service_providers"
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
      query_execution_log: {
        Row: {
          actual_reward: number | null
          articles_found: number | null
          duplicate_count: number | null
          executed_at: string
          id: string
          learning_state_id: string | null
          novelty_score: number | null
          predicted_reward: number | null
          query_features: Json
          query_text: string
          ucb_score: number | null
          uncertainty: number | null
        }
        Insert: {
          actual_reward?: number | null
          articles_found?: number | null
          duplicate_count?: number | null
          executed_at?: string
          id?: string
          learning_state_id?: string | null
          novelty_score?: number | null
          predicted_reward?: number | null
          query_features: Json
          query_text: string
          ucb_score?: number | null
          uncertainty?: number | null
        }
        Update: {
          actual_reward?: number | null
          articles_found?: number | null
          duplicate_count?: number | null
          executed_at?: string
          id?: string
          learning_state_id?: string | null
          novelty_score?: number | null
          predicted_reward?: number | null
          query_features?: Json
          query_text?: string
          ucb_score?: number | null
          uncertainty?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "query_execution_log_learning_state_id_fkey"
            columns: ["learning_state_id"]
            isOneToOne: false
            referencedRelation: "query_learning_state"
            referencedColumns: ["id"]
          },
        ]
      }
      query_learning_state: {
        Row: {
          a_matrix: Json
          avg_reward: number | null
          context_key: string
          created_at: string
          effective_terms: Json
          exhausted_topics: string[] | null
          id: string
          last_updated: string
          proven_patterns: Json
          theta: Json
          total_queries: number | null
        }
        Insert: {
          a_matrix?: Json
          avg_reward?: number | null
          context_key: string
          created_at?: string
          effective_terms?: Json
          exhausted_topics?: string[] | null
          id?: string
          last_updated?: string
          proven_patterns?: Json
          theta?: Json
          total_queries?: number | null
        }
        Update: {
          a_matrix?: Json
          avg_reward?: number | null
          context_key?: string
          created_at?: string
          effective_terms?: Json
          exhausted_topics?: string[] | null
          id?: string
          last_updated?: string
          proven_patterns?: Json
          theta?: Json
          total_queries?: number | null
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
      search_result_ratings: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          novelty_rating: number | null
          quality_rating: number | null
          relevance_rating: number | null
          search_result_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          novelty_rating?: number | null
          quality_rating?: number | null
          relevance_rating?: number | null
          search_result_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          novelty_rating?: number | null
          quality_rating?: number | null
          relevance_rating?: number | null
          search_result_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_result_ratings_search_result_id_fkey"
            columns: ["search_result_id"]
            isOneToOne: false
            referencedRelation: "search_results"
            referencedColumns: ["id"]
          },
        ]
      }
      search_results: {
        Row: {
          added_to_pending: boolean | null
          ai_confidence_score: number | null
          author: string | null
          automated_search_id: string
          created_at: string | null
          description: string | null
          discovered_at: string | null
          duplicate_of: string | null
          exa_id: string | null
          exa_metadata: Json | null
          exa_score: number | null
          excerpt: string | null
          final_score: number | null
          id: string
          image_url: string | null
          pending_article_id: string | null
          processed: boolean | null
          processed_at: string | null
          published_date: string | null
          relevance_score: number | null
          score_source: string | null
          skip_reason: string | null
          source_url: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          added_to_pending?: boolean | null
          ai_confidence_score?: number | null
          author?: string | null
          automated_search_id: string
          created_at?: string | null
          description?: string | null
          discovered_at?: string | null
          duplicate_of?: string | null
          exa_id?: string | null
          exa_metadata?: Json | null
          exa_score?: number | null
          excerpt?: string | null
          final_score?: number | null
          id?: string
          image_url?: string | null
          pending_article_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          published_date?: string | null
          relevance_score?: number | null
          score_source?: string | null
          skip_reason?: string | null
          source_url: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          added_to_pending?: boolean | null
          ai_confidence_score?: number | null
          author?: string | null
          automated_search_id?: string
          created_at?: string | null
          description?: string | null
          discovered_at?: string | null
          duplicate_of?: string | null
          exa_id?: string | null
          exa_metadata?: Json | null
          exa_score?: number | null
          excerpt?: string | null
          final_score?: number | null
          id?: string
          image_url?: string | null
          pending_article_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          published_date?: string | null
          relevance_score?: number | null
          score_source?: string | null
          skip_reason?: string | null
          source_url?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_results_automated_search_id_fkey"
            columns: ["automated_search_id"]
            isOneToOne: false
            referencedRelation: "automated_searches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_results_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "search_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_results_pending_article_id_fkey"
            columns: ["pending_article_id"]
            isOneToOne: false
            referencedRelation: "pending_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
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
          location: string | null
          mode: string | null
          mode_contract: string | null
          mode_name: string | null
          mode_voms: number | null
          months_seller_operated_in_fy: number | null
          name: string
          notes: string | null
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
          provider_type: string | null
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
          transportation_provider: string | null
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
          website: string | null
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
          location?: string | null
          mode?: string | null
          mode_contract?: string | null
          mode_name?: string | null
          mode_voms?: number | null
          months_seller_operated_in_fy?: number | null
          name: string
          notes?: string | null
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
          provider_type?: string | null
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
          transportation_provider?: string | null
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
          website?: string | null
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
          location?: string | null
          mode?: string | null
          mode_contract?: string | null
          mode_name?: string | null
          mode_voms?: number | null
          months_seller_operated_in_fy?: number | null
          name?: string
          notes?: string | null
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
          provider_type?: string | null
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
          transportation_provider?: string | null
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
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transportation_providers_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      software_providers: {
        Row: {
          category: string
          certifications: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          deployment_type: string | null
          description: string | null
          headquarters: string | null
          id: string
          integrations: Json | null
          logo_url: string | null
          modes: string[] | null
          name: string
          notes: string | null
          pricing_model: string | null
          product_name: string | null
          subcategory: string | null
          updated_at: string
          website: string | null
          year_founded: number | null
        }
        Insert: {
          category: string
          certifications?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          deployment_type?: string | null
          description?: string | null
          headquarters?: string | null
          id?: string
          integrations?: Json | null
          logo_url?: string | null
          modes?: string[] | null
          name: string
          notes?: string | null
          pricing_model?: string | null
          product_name?: string | null
          subcategory?: string | null
          updated_at?: string
          website?: string | null
          year_founded?: number | null
        }
        Update: {
          category?: string
          certifications?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          deployment_type?: string | null
          description?: string | null
          headquarters?: string | null
          id?: string
          integrations?: Json | null
          logo_url?: string | null
          modes?: string[] | null
          name?: string
          notes?: string | null
          pricing_model?: string | null
          product_name?: string | null
          subcategory?: string | null
          updated_at?: string
          website?: string | null
          year_founded?: number | null
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
          logo_url: string | null
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
          logo_url?: string | null
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
          logo_url?: string | null
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
          agency_id: string
          agency_name: string | null
          buyer_provides_maintenance_facility_to_seller: boolean | null
          buyer_supplies_vehicles_to_seller: boolean | null
          contract_capital_leasing_expenses: number | null
          contractee_agency_id: string | null
          contractee_ntd_id: string | null
          contractee_operator_name: string | null
          cost_per_hour: number | null
          cost_per_passenger: number | null
          cost_per_passenger_mile: number | null
          created_at: string
          direct_payment_agency_subsidy: number | null
          fare_revenues_earned: number | null
          fares_retained_by: string | null
          id: string
          mode: string | null
          months_seller_operated_in_fy: number | null
          ntd_id: string | null
          other_operating_expenses_incurred_by_the_buyer: number | null
          other_party: string | null
          other_public_assets_provided: string | null
          other_public_assets_provided_desc: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer: number | null
          passenger_miles: number | null
          passenger_out_of_pocket_expenses: number | null
          passengers_per_hour: number | null
          primary_feature: string | null
          provider_id: string | null
          provider_name: string | null
          pt_fare_revenues_passenger_fees: number | null
          reporter_contractual_position: string | null
          reporter_type: string | null
          reporting_module: string | null
          service_captured: string | null
          tos: string | null
          total_modal_expenses: number | null
          total_operating_expenses: number | null
          type_of_contract: string | null
          unlinked_passenger_trips: number | null
          updated_at: string
          vehicle_revenue_hours: number | null
          vehicle_revenue_miles: number | null
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
          cost_per_hour?: number | null
          cost_per_passenger?: number | null
          cost_per_passenger_mile?: number | null
          created_at?: string
          direct_payment_agency_subsidy?: number | null
          fare_revenues_earned?: number | null
          fares_retained_by?: string | null
          id?: string
          mode?: string | null
          months_seller_operated_in_fy?: number | null
          ntd_id?: string | null
          other_operating_expenses_incurred_by_the_buyer?: number | null
          other_party?: string | null
          other_public_assets_provided?: string | null
          other_public_assets_provided_desc?: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer?: number | null
          passenger_miles?: number | null
          passenger_out_of_pocket_expenses?: number | null
          passengers_per_hour?: number | null
          primary_feature?: string | null
          provider_id?: string | null
          provider_name?: string | null
          pt_fare_revenues_passenger_fees?: number | null
          reporter_contractual_position?: string | null
          reporter_type?: string | null
          reporting_module?: string | null
          service_captured?: string | null
          tos?: string | null
          total_modal_expenses?: number | null
          total_operating_expenses?: number | null
          type_of_contract?: string | null
          unlinked_passenger_trips?: number | null
          updated_at?: string
          vehicle_revenue_hours?: number | null
          vehicle_revenue_miles?: number | null
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
          cost_per_hour?: number | null
          cost_per_passenger?: number | null
          cost_per_passenger_mile?: number | null
          created_at?: string
          direct_payment_agency_subsidy?: number | null
          fare_revenues_earned?: number | null
          fares_retained_by?: string | null
          id?: string
          mode?: string | null
          months_seller_operated_in_fy?: number | null
          ntd_id?: string | null
          other_operating_expenses_incurred_by_the_buyer?: number | null
          other_party?: string | null
          other_public_assets_provided?: string | null
          other_public_assets_provided_desc?: string | null
          other_reconciling_item_expenses_incurred_by_the_buyer?: number | null
          passenger_miles?: number | null
          passenger_out_of_pocket_expenses?: number | null
          passengers_per_hour?: number | null
          primary_feature?: string | null
          provider_id?: string | null
          provider_name?: string | null
          pt_fare_revenues_passenger_fees?: number | null
          reporter_contractual_position?: string | null
          reporter_type?: string | null
          reporting_module?: string | null
          service_captured?: string | null
          tos?: string | null
          total_modal_expenses?: number | null
          total_operating_expenses?: number | null
          type_of_contract?: string | null
          unlinked_passenger_trips?: number | null
          updated_at?: string
          vehicle_revenue_hours?: number | null
          vehicle_revenue_miles?: number | null
          voms_under_contract?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transportation_providers_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "transit_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportation_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_final_score: {
        Args: { ai_confidence: number; relevance: number }
        Returns: number
      }
      calculate_next_run: {
        Args: { base_time: string; freq: string }
        Returns: string
      }
      check_duplicate_url: {
        Args: { url_to_check: string }
        Returns: {
          discovered: string
          is_processed: boolean
          pending_id: string
          result_id: string
          search_id: string
        }[]
      }
      get_search_processing_stats: {
        Args: { search_id: string }
        Returns: {
          added_to_pending_count: number
          avg_relevance_score: number
          duplicate_count: number
          processed_count: number
          skipped_count: number
          total_results: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_result_processed: {
        Args: {
          pending_id?: string
          result_id: string
          skip_reason_text?: string
        }
        Returns: undefined
      }
      update_search_after_run: {
        Args: {
          error_message?: string
          result_count?: number
          search_id: string
          success: boolean
        }
        Returns: undefined
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
