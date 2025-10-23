// Database schema types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          email: string | null;
          fid: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          email?: string | null;
          fid?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          email?: string | null;
          fid?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ens_records: {
        Row: {
          id: string;
          user_id: string;
          ens_name: string;
          expiry_date: string;
          notified: boolean;
          last_notified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ens_name: string;
          expiry_date: string;
          notified?: boolean;
          last_notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ens_name?: string;
          expiry_date?: string;
          notified?: boolean;
          last_notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type EnsRecord = Database['public']['Tables']['ens_records']['Row'];
export type EnsRecordInsert = Database['public']['Tables']['ens_records']['Insert'];
export type EnsRecordUpdate = Database['public']['Tables']['ens_records']['Update'];
