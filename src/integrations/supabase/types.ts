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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          course: string | null
          created_at: string
          deadline: string | null
          id: string
          notes: string | null
          status: string
          university_id: string | null
          university_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          notes?: string | null
          status?: string
          university_id?: string | null
          university_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          notes?: string | null
          status?: string
          university_id?: string | null
          university_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      gamification: {
        Row: {
          badges: string[] | null
          created_at: string
          id: string
          last_login_date: string | null
          level: number
          login_streak: number
          points: number
          referral_code: string | null
          referrals_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: string[] | null
          created_at?: string
          id?: string
          last_login_date?: string | null
          level?: number
          login_streak?: number
          points?: number
          referral_code?: string | null
          referrals_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: string[] | null
          created_at?: string
          id?: string
          last_login_date?: string | null
          level?: number
          login_streak?: number
          points?: number
          referral_code?: string | null
          referrals_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount: number
          bank_name: string
          collateral_type: string | null
          created_at: string
          documents_submitted: string[] | null
          emi: number | null
          id: string
          interest_rate: number | null
          notes: string | null
          status: string
          tenure_months: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_name: string
          collateral_type?: string | null
          created_at?: string
          documents_submitted?: string[] | null
          emi?: number | null
          id?: string
          interest_rate?: number | null
          notes?: string | null
          status?: string
          tenure_months?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_name?: string
          collateral_type?: string | null
          created_at?: string
          documents_submitted?: string[] | null
          emi?: number | null
          id?: string
          interest_rate?: number | null
          notes?: string | null
          status?: string
          tenure_months?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_history: string | null
          avatar_url: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          display_name: string | null
          email: string | null
          gpa: number | null
          id: string
          interests: string[] | null
          preferred_countries: string[] | null
          test_scores: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_history?: string | null
          avatar_url?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          gpa?: number | null
          id?: string
          interests?: string[] | null
          preferred_countries?: string[] | null
          test_scores?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_history?: string | null
          avatar_url?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          gpa?: number | null
          id?: string
          interests?: string[] | null
          preferred_countries?: string[] | null
          test_scores?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sop_drafts: {
        Row: {
          content: string
          course: string | null
          created_at: string
          id: string
          prompt_context: Json | null
          university_name: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          content?: string
          course?: string | null
          created_at?: string
          id?: string
          prompt_context?: Json | null
          university_name?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          content?: string
          course?: string | null
          created_at?: string
          id?: string
          prompt_context?: Json | null
          university_name?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      universities: {
        Row: {
          acceptance_rate: number | null
          city: string | null
          country: string
          courses: string[] | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          ranking: number | null
          requirements: Json | null
          tuition_max: number | null
          tuition_min: number | null
          website: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          city?: string | null
          country: string
          courses?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          ranking?: number | null
          requirements?: Json | null
          tuition_max?: number | null
          tuition_min?: number | null
          website?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          city?: string | null
          country?: string
          courses?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          ranking?: number | null
          requirements?: Json | null
          tuition_max?: number | null
          tuition_min?: number | null
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
