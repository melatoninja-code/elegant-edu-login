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
      classrooms: {
        Row: {
          building: string
          capacity: number
          created_at: string
          created_by: string
          description: string | null
          floor: number
          id: string
          is_available: boolean
          name: string
          room_number: string
          type: Database["public"]["Enums"]["classroom_type"]
          updated_at: string
        }
        Insert: {
          building?: string
          capacity: number
          created_at?: string
          created_by: string
          description?: string | null
          floor?: number
          id?: string
          is_available?: boolean
          name: string
          room_number: string
          type?: Database["public"]["Enums"]["classroom_type"]
          updated_at?: string
        }
        Update: {
          building?: string
          capacity?: number
          created_at?: string
          created_by?: string
          description?: string | null
          floor?: number
          id?: string
          is_available?: boolean
          name?: string
          room_number?: string
          type?: Database["public"]["Enums"]["classroom_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      room_bookings: {
        Row: {
          classroom_id: string
          created_at: string
          created_by: string
          end_time: string
          id: string
          purpose: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          teacher_id: string
          updated_at: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          created_by: string
          end_time: string
          id?: string
          purpose: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          teacher_id: string
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          created_by?: string
          end_time?: string
          id?: string
          purpose?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          student_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          student_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          student_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string
          class_section: string | null
          created_at: string
          created_by: string
          date_of_birth: string
          dorm_room: string | null
          email: string | null
          emergency_contact_1_name: string | null
          emergency_contact_1_phone: string | null
          emergency_contact_2_name: string | null
          emergency_contact_2_phone: string | null
          enrollment_date: string
          gender: string
          grade_level: number
          id: string
          name: string
          parent_name: string | null
          parent_phone: string | null
          phone_number: string | null
          profile_picture_url: string | null
          status: Database["public"]["Enums"]["student_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          address: string
          class_section?: string | null
          created_at?: string
          created_by: string
          date_of_birth: string
          dorm_room?: string | null
          email?: string | null
          emergency_contact_1_name?: string | null
          emergency_contact_1_phone?: string | null
          emergency_contact_2_name?: string | null
          emergency_contact_2_phone?: string | null
          enrollment_date?: string
          gender: string
          grade_level: number
          id?: string
          name: string
          parent_name?: string | null
          parent_phone?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          class_section?: string | null
          created_at?: string
          created_by?: string
          date_of_birth?: string
          dorm_room?: string | null
          email?: string | null
          emergency_contact_1_name?: string | null
          emergency_contact_1_phone?: string | null
          emergency_contact_2_name?: string | null
          emergency_contact_2_phone?: string | null
          enrollment_date?: string
          gender?: string
          grade_level?: number
          id?: string
          name?: string
          parent_name?: string | null
          parent_phone?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_student_assignments: {
        Row: {
          created_at: string
          created_by: string
          id: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_student_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_student_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_student_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_tags: {
        Row: {
          created_at: string
          created_by: string
          id: string
          tag: string
          teacher_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          tag: string
          teacher_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          tag?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_tags_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          account_email: string | null
          account_password: string | null
          address: string
          auth_id: string | null
          created_at: string
          created_by: string
          dorm_room: string | null
          email: string | null
          gender: string
          id: string
          name: string
          phone_number: string
          profile_picture_url: string | null
          studies: string
        }
        Insert: {
          account_email?: string | null
          account_password?: string | null
          address: string
          auth_id?: string | null
          created_at?: string
          created_by: string
          dorm_room?: string | null
          email?: string | null
          gender: string
          id?: string
          name: string
          phone_number: string
          profile_picture_url?: string | null
          studies: string
        }
        Update: {
          account_email?: string | null
          account_password?: string | null
          address?: string
          auth_id?: string | null
          created_at?: string
          created_by?: string
          dorm_room?: string | null
          email?: string | null
          gender?: string
          id?: string
          name?: string
          phone_number?: string
          profile_picture_url?: string | null
          studies?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "completed"
      classroom_type:
        | "lecture_hall"
        | "laboratory"
        | "standard"
        | "computer_lab"
        | "music_room"
        | "art_studio"
        | "gymnasium"
      student_status: "active" | "inactive" | "graduated" | "suspended"
      teacher_tag:
        | "head_teacher"
        | "senior_teacher"
        | "junior_teacher"
        | "substitute_teacher"
        | "intern"
        | "math_teacher"
        | "science_teacher"
        | "english_teacher"
        | "history_teacher"
        | "art_teacher"
        | "music_teacher"
        | "pe_teacher"
        | "homeroom_teacher"
        | "curriculum_coordinator"
        | "student_counselor"
      user_role: "admin" | "user"
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
