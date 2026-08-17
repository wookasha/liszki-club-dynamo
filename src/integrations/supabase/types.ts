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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      club_history: {
        Row: {
          content: string
          id: string
          updated_at: string
        }
        Insert: {
          content?: string
          id?: string
          updated_at?: string
        }
        Update: {
          content?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      extra_team_logos: {
        Row: {
          logo_url: string
          team: string
          updated_at: string
        }
        Insert: {
          logo_url: string
          team: string
          updated_at?: string
        }
        Update: {
          logo_url?: string
          team?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          cover_image_url: string | null
          created_at: string
          google_photos_url: string | null
          id: string
          photo_count: number
          r2_folder_path: string
          sort_order: number
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          google_photos_url?: string | null
          id?: string
          photo_count?: number
          r2_folder_path?: string
          sort_order?: number
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          google_photos_url?: string | null
          id?: string
          photo_count?: number
          r2_folder_path?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          album: string
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string
        }
        Insert: {
          album?: string
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title: string
        }
        Update: {
          album?: string
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      league_table: {
        Row: {
          created_at: string
          drawn: number
          goals_against: number
          goals_for: number
          id: string
          is_own_team: boolean
          logo_url: string | null
          lost: number
          played: number
          points: number
          position: number
          stadium_address: string
          team: string
          won: number
        }
        Insert: {
          created_at?: string
          drawn?: number
          goals_against?: number
          goals_for?: number
          id?: string
          is_own_team?: boolean
          logo_url?: string | null
          lost?: number
          played?: number
          points?: number
          position: number
          stadium_address?: string
          team: string
          won?: number
        }
        Update: {
          created_at?: string
          drawn?: number
          goals_against?: number
          goals_for?: number
          id?: string
          is_own_team?: boolean
          logo_url?: string | null
          lost?: number
          played?: number
          points?: number
          position?: number
          stadium_address?: string
          team?: string
          won?: number
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_team: string
          created_at: string
          home_team: string
          id: string
          is_played: boolean
          league: string
          match_date: string
          news_slug: string | null
          score_away: number | null
          score_home: number | null
          scorers: Json | null
          stadium_address: string
          venue: string
        }
        Insert: {
          away_team: string
          created_at?: string
          home_team: string
          id?: string
          is_played?: boolean
          league?: string
          match_date: string
          news_slug?: string | null
          score_away?: number | null
          score_home?: number | null
          scorers?: Json | null
          stadium_address?: string
          venue?: string
        }
        Update: {
          away_team?: string
          created_at?: string
          home_team?: string
          id?: string
          is_played?: boolean
          league?: string
          match_date?: string
          news_slug?: string | null
          score_away?: number | null
          score_home?: number | null
          scorers?: Json | null
          stadium_address?: string
          venue?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          count: number
          created_at: string
          id: string
          player_name: string
          sort_order: number
          stat_type: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          player_name: string
          sort_order?: number
          stat_type?: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          player_name?: string
          sort_order?: number
          stat_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          sort_order: number
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
          website_url?: string | null
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          birth_year: number | null
          created_at: string
          full_name: string
          id: string
          is_captain: boolean
          photo_url: string | null
          position: string
          role_label: string | null
          shirt_number: number | null
          sort_order: number
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          full_name: string
          id?: string
          is_captain?: boolean
          photo_url?: string | null
          position?: string
          role_label?: string | null
          shirt_number?: number | null
          sort_order?: number
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          full_name?: string
          id?: string
          is_captain?: boolean
          photo_url?: string | null
          position?: string
          role_label?: string | null
          shirt_number?: number | null
          sort_order?: number
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string
          description: string
          id: string
          sort_order: number
          title: string
          year_label: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title?: string
          year_label: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title?: string
          year_label?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      youth_groups: {
        Row: {
          ages: string
          coach: string
          created_at: string
          id: string
          location: string
          name: string
          schedule: string
          sort_order: number
        }
        Insert: {
          ages?: string
          coach?: string
          created_at?: string
          id?: string
          location?: string
          name: string
          schedule?: string
          sort_order?: number
        }
        Update: {
          ages?: string
          coach?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          schedule?: string
          sort_order?: number
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
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
