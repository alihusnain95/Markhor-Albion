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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author: string | null
          body: string | null
          categories: string[]
          city: string | null
          cover_url: string | null
          created_at: string
          destination_id: string | null
          id: string
          intro: string | null
          is_featured: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          tags: string[]
          title: string
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          categories?: string[]
          city?: string | null
          cover_url?: string | null
          created_at?: string
          destination_id?: string | null
          id?: string
          intro?: string | null
          is_featured?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title: string
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          categories?: string[]
          city?: string | null
          cover_url?: string | null
          created_at?: string
          destination_id?: string | null
          id?: string
          intro?: string | null
          is_featured?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title?: string
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_visits: {
        Row: {
          cities_explored: string[]
          created_at: string
          destination_id: string
          highlights: string | null
          id: string
          personal_notes: string | null
          planning_notes: string | null
          status: Database["public"]["Enums"]["visit_status"]
          updated_at: string
          visit_count: number | null
        }
        Insert: {
          cities_explored?: string[]
          created_at?: string
          destination_id: string
          highlights?: string | null
          id?: string
          personal_notes?: string | null
          planning_notes?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
          visit_count?: number | null
        }
        Update: {
          cities_explored?: string[]
          created_at?: string
          destination_id?: string
          highlights?: string | null
          id?: string
          personal_notes?: string | null
          planning_notes?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_visits_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: true
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          capital: string | null
          continent: string | null
          created_at: string
          custom_sections: Json
          flag: string | null
          general_info: string | null
          id: string
          is_published: boolean
          iso2: string | null
          lat: number | null
          lng: number | null
          map_key: string | null
          name: string
          parent_id: string | null
          slug: string
          status_description: string | null
          travel_tips: string | null
          type: Database["public"]["Enums"]["destination_type"]
          updated_at: string
        }
        Insert: {
          capital?: string | null
          continent?: string | null
          created_at?: string
          custom_sections?: Json
          flag?: string | null
          general_info?: string | null
          id?: string
          is_published?: boolean
          iso2?: string | null
          lat?: number | null
          lng?: number | null
          map_key?: string | null
          name: string
          parent_id?: string | null
          slug: string
          status_description?: string | null
          travel_tips?: string | null
          type?: Database["public"]["Enums"]["destination_type"]
          updated_at?: string
        }
        Update: {
          capital?: string | null
          continent?: string | null
          created_at?: string
          custom_sections?: Json
          flag?: string | null
          general_info?: string | null
          id?: string
          is_published?: boolean
          iso2?: string | null
          lat?: number | null
          lng?: number | null
          map_key?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          status_description?: string | null
          travel_tips?: string | null
          type?: Database["public"]["Enums"]["destination_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destinations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          album: string | null
          alt_text: string | null
          caption: string | null
          created_at: string
          destination_id: string | null
          id: string
          is_featured: boolean
          is_public: boolean
          kind: string
          location: string | null
          place: string | null
          sort_order: number
          taken_on: string | null
          thumbnail_url: string | null
          updated_at: string
          url: string
        }
        Insert: {
          album?: string | null
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          destination_id?: string | null
          id?: string
          is_featured?: boolean
          is_public?: boolean
          kind?: string
          location?: string | null
          place?: string | null
          sort_order?: number
          taken_on?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          album?: string | null
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          destination_id?: string | null
          id?: string
          is_featured?: boolean
          is_public?: boolean
          kind?: string
          location?: string | null
          place?: string | null
          sort_order?: number
          taken_on?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      pakistan_wonders: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          personal_notes: string | null
          region: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["pk_status"]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          personal_notes?: string | null
          region: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["pk_status"]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          personal_notes?: string | null
          region?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["pk_status"]
          updated_at?: string
        }
        Relationships: []
      }
      planned_trips: {
        Row: {
          accommodation_notes: string | null
          budget: string | null
          created_at: string
          destination_id: string | null
          goals: string | null
          id: string
          intended_end: string | null
          intended_start: string | null
          is_public: boolean
          itinerary: string | null
          packing: Json
          status: Database["public"]["Enums"]["plan_status"]
          title: string
          transport_notes: string | null
          updated_at: string
        }
        Insert: {
          accommodation_notes?: string | null
          budget?: string | null
          created_at?: string
          destination_id?: string | null
          goals?: string | null
          id?: string
          intended_end?: string | null
          intended_start?: string | null
          is_public?: boolean
          itinerary?: string | null
          packing?: Json
          status?: Database["public"]["Enums"]["plan_status"]
          title: string
          transport_notes?: string | null
          updated_at?: string
        }
        Update: {
          accommodation_notes?: string | null
          budget?: string | null
          created_at?: string
          destination_id?: string | null
          goals?: string | null
          id?: string
          intended_end?: string | null
          intended_start?: string | null
          is_public?: boolean
          itinerary?: string | null
          packing?: Json
          status?: Database["public"]["Enums"]["plan_status"]
          title?: string
          transport_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_trips_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      trip_destinations: {
        Row: {
          destination_id: string
          trip_id: string
        }
        Insert: {
          destination_id: string
          trip_id: string
        }
        Update: {
          destination_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_destinations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_destinations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          cities: string[]
          created_at: string
          end_date: string | null
          id: string
          is_public: boolean
          notes: string | null
          start_date: string | null
          title: string
          transport_notes: string | null
          updated_at: string
        }
        Insert: {
          cities?: string[]
          created_at?: string
          end_date?: string | null
          id?: string
          is_public?: boolean
          notes?: string | null
          start_date?: string | null
          title: string
          transport_notes?: string | null
          updated_at?: string
        }
        Update: {
          cities?: string[]
          created_at?: string
          end_date?: string | null
          id?: string
          is_public?: boolean
          notes?: string | null
          start_date?: string | null
          title?: string
          transport_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unesco_sites: {
        Row: {
          countries: string
          created_at: string
          description: string | null
          destination_id: string | null
          id: string
          lat: number | null
          list_status: Database["public"]["Enums"]["unesco_list"]
          lng: number | null
          official_name: string
          official_url: string | null
          personal_notes: string | null
          site_type: Database["public"]["Enums"]["unesco_type"]
          status: Database["public"]["Enums"]["visit_status"]
          unesco_ref: string | null
          updated_at: string
          visit_date: string | null
          year_inscribed: number | null
        }
        Insert: {
          countries: string
          created_at?: string
          description?: string | null
          destination_id?: string | null
          id?: string
          lat?: number | null
          list_status?: Database["public"]["Enums"]["unesco_list"]
          lng?: number | null
          official_name: string
          official_url?: string | null
          personal_notes?: string | null
          site_type: Database["public"]["Enums"]["unesco_type"]
          status?: Database["public"]["Enums"]["visit_status"]
          unesco_ref?: string | null
          updated_at?: string
          visit_date?: string | null
          year_inscribed?: number | null
        }
        Update: {
          countries?: string
          created_at?: string
          description?: string | null
          destination_id?: string | null
          id?: string
          lat?: number | null
          list_status?: Database["public"]["Enums"]["unesco_list"]
          lng?: number | null
          official_name?: string
          official_url?: string | null
          personal_notes?: string | null
          site_type?: Database["public"]["Enums"]["unesco_type"]
          status?: Database["public"]["Enums"]["visit_status"]
          unesco_ref?: string | null
          updated_at?: string
          visit_date?: string | null
          year_inscribed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "unesco_sites_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
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
      world_wonders: {
        Row: {
          category: string
          created_at: string
          description: string | null
          destination_id: string | null
          id: string
          location: string | null
          name: string
          personal_notes: string | null
          sort_order: number
          source_url: string | null
          status: Database["public"]["Enums"]["wonder_status"]
          updated_at: string
          verified_facts: string | null
          visit_date: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          destination_id?: string | null
          id?: string
          location?: string | null
          name: string
          personal_notes?: string | null
          sort_order?: number
          source_url?: string | null
          status?: Database["public"]["Enums"]["wonder_status"]
          updated_at?: string
          verified_facts?: string | null
          visit_date?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          destination_id?: string | null
          id?: string
          location?: string | null
          name?: string
          personal_notes?: string | null
          sort_order?: number
          source_url?: string | null
          status?: Database["public"]["Enums"]["wonder_status"]
          updated_at?: string
          verified_facts?: string | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "world_wonders_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      article_status: "draft" | "published"
      destination_type:
        | "sovereign"
        | "constituent"
        | "territory"
        | "sar"
        | "disputed"
        | "other"
      pk_status: "visited" | "planned" | "not_visited" | "not_confirmed"
      plan_status:
        | "dreaming"
        | "researching"
        | "planned"
        | "booked"
        | "completed"
      unesco_list: "inscribed" | "tentative"
      unesco_type: "cultural" | "natural" | "mixed"
      visit_status: "visited" | "planned" | "not_visited" | "needs_confirmation"
      wonder_status:
        | "completed"
        | "planned"
        | "not_visited"
        | "needs_confirmation"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      article_status: ["draft", "published"],
      destination_type: [
        "sovereign",
        "constituent",
        "territory",
        "sar",
        "disputed",
        "other",
      ],
      pk_status: ["visited", "planned", "not_visited", "not_confirmed"],
      plan_status: [
        "dreaming",
        "researching",
        "planned",
        "booked",
        "completed",
      ],
      unesco_list: ["inscribed", "tentative"],
      unesco_type: ["cultural", "natural", "mixed"],
      visit_status: ["visited", "planned", "not_visited", "needs_confirmation"],
      wonder_status: [
        "completed",
        "planned",
        "not_visited",
        "needs_confirmation",
      ],
    },
  },
} as const
