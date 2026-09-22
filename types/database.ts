export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Customer {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
}

export interface Product {
  id: string
  created_at: string
  name: string
  description: string | null
  price: number
  category: string | null
  stock: number
  sizes: string[] | null
  colors: string[] | null
  image_url: string | null
}

export interface Conversation {
  id: string
  created_at: string
  status: string
  customer_id: string | null
  channel: string | null
  last_message_at: string | null
}

export interface Message {
  id: string
  created_at: string
  conversation_id: string | null
  sender: string
  message: string
}

export interface Appointment {
  id: string
  created_at: string
  notes: string | null
  status: string
  customer_id: string | null
  appointment_date: string
}

export interface FollowUp {
  id: string
  created_at: string
  status: string
  customer_id: string | null
  message: string | null
  scheduled_at: string | null
}

export interface Automation {
  id: string
  created_at: string
  name: string
  status: string
  description: string | null
}

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer
        Insert: {
          id?: string
          created_at?: string
          name: string
          email?: string | null
          phone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      products: {
        Row: Product
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price?: number
          category?: string | null
          stock?: number
          sizes?: string[] | null
          colors?: string[] | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          category?: string | null
          stock?: number
          sizes?: string[] | null
          colors?: string[] | null
          image_url?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: Conversation
        Insert: {
          id?: string
          created_at?: string
          status?: string
          customer_id?: string | null
          channel?: string | null
          last_message_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          status?: string
          customer_id?: string | null
          channel?: string | null
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: Message
        Insert: {
          id?: string
          created_at?: string
          conversation_id?: string | null
          sender: string
          message: string
        }
        Update: {
          id?: string
          created_at?: string
          conversation_id?: string | null
          sender?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      appointments: {
        Row: Appointment
        Insert: {
          id?: string
          created_at?: string
          notes?: string | null
          status?: string
          customer_id?: string | null
          appointment_date: string
        }
        Update: {
          id?: string
          created_at?: string
          notes?: string | null
          status?: string
          customer_id?: string | null
          appointment_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      follow_ups: {
        Row: FollowUp
        Insert: {
          id?: string
          created_at?: string
          status?: string
          customer_id?: string | null
          message?: string | null
          scheduled_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          status?: string
          customer_id?: string | null
          message?: string | null
          scheduled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      automations: {
        Row: Automation
        Insert: {
          id?: string
          created_at?: string
          name: string
          status?: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          status?: string
          description?: string | null
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
