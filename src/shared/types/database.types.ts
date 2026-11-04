/**
 * Hand-maintained mirror of the Supabase schema.
 *
 * Regenerate after changing migrations with:
 *   npm run db:types
 *
 * The command writes `database.generated.ts`; keep this file in sync or switch
 * imports to the generated file once a local Supabase instance is available.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ReservationStatus = "pending" | "confirmed" | "checked_in" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";
export type PaymentMethod = "cash" | "bank_transfer" | "credit_card" | "debit_card" | "ewallet";
export type OccupancyStatus = "available" | "reserved" | "occupied";
export type HousekeepingStatus = "clean" | "dirty" | "cleaning";
export type HousekeepingTaskType =
  "checkout_clean" | "stayover_clean" | "deep_clean" | "inspection";

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          code: string;
          module: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          module: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          module?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: { role_id: string; permission_id: string; created_at: string };
        Insert: { role_id: string; permission_id: string; created_at?: string };
        Update: { role_id?: string; permission_id?: string; created_at?: string };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_types: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          capacity: number;
          size_sqm: number | null;
          bed_type: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          capacity: number;
          size_sqm?: number | null;
          bed_type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          capacity?: number;
          size_sqm?: number | null;
          bed_type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          room_number: string;
          room_type_id: string;
          floor: number;
          notes: string | null;
          occupancy_status: OccupancyStatus;
          housekeeping_status: HousekeepingStatus;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_number: string;
          room_type_id: string;
          floor?: number;
          notes?: string | null;
          occupancy_status?: OccupancyStatus;
          housekeeping_status?: HousekeepingStatus;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_number?: string;
          room_type_id?: string;
          floor?: number;
          notes?: string | null;
          occupancy_status?: OccupancyStatus;
          housekeeping_status?: HousekeepingStatus;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      facilities: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          category: string;
          icon: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          category?: string;
          icon?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          category?: string;
          icon?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_type_facilities: {
        Row: { room_type_id: string; facility_id: string; created_at: string };
        Insert: { room_type_id: string; facility_id: string; created_at?: string };
        Update: { room_type_id?: string; facility_id?: string; created_at?: string };
        Relationships: [];
      };
      room_rates: {
        Row: {
          id: string;
          room_type_id: string;
          rate_per_night: number;
          currency: string;
          valid_from: string;
          valid_to: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_type_id: string;
          rate_per_night: number;
          currency?: string;
          valid_from: string;
          valid_to?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_type_id?: string;
          rate_per_night?: number;
          currency?: string;
          valid_from?: string;
          valid_to?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reservations: {
        Row: {
          id: string;
          reservation_code: string;
          guest_id: string;
          room_type_id: string;
          check_in_date: string;
          check_out_date: string;
          nights: number;
          room_count: number;
          adults: number;
          children: number;
          special_requests: string | null;
          status: ReservationStatus;
          rate_per_night: number;
          total_amount: number;
          currency: string;
          created_by: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reservation_code?: string;
          guest_id: string;
          room_type_id: string;
          check_in_date: string;
          check_out_date: string;
          nights: number;
          room_count?: number;
          adults?: number;
          children?: number;
          special_requests?: string | null;
          status?: ReservationStatus;
          rate_per_night: number;
          total_amount: number;
          currency?: string;
          created_by?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reservation_code?: string;
          guest_id?: string;
          room_type_id?: string;
          check_in_date?: string;
          check_out_date?: string;
          nights?: number;
          room_count?: number;
          adults?: number;
          children?: number;
          special_requests?: string | null;
          status?: ReservationStatus;
          rate_per_night?: number;
          total_amount?: number;
          currency?: string;
          created_by?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reservation_rooms: {
        Row: {
          id: string;
          reservation_id: string;
          room_id: string;
          check_in_date: string;
          check_out_date: string;
          nights: number;
          rate_per_night: number;
          subtotal: number;
          stay: string;
          allocated_by: string | null;
          allocated_at: string;
          released_at: string | null;
          release_reason: string | null;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          room_id: string;
          check_in_date?: string;
          check_out_date?: string;
          nights?: number;
          rate_per_night?: number;
          subtotal?: number;
          allocated_by?: string | null;
          allocated_at?: string;
          released_at?: string | null;
          release_reason?: string | null;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          room_id?: string;
          check_in_date?: string;
          check_out_date?: string;
          nights?: number;
          rate_per_night?: number;
          subtotal?: number;
          allocated_by?: string | null;
          allocated_at?: string;
          released_at?: string | null;
          release_reason?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          reservation_id: string;
          amount: number;
          currency: string;
          status: PaymentStatus;
          method: PaymentMethod | null;
          paid_at: string | null;
          recorded_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          method?: PaymentMethod | null;
          paid_at?: string | null;
          recorded_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          method?: PaymentMethod | null;
          paid_at?: string | null;
          recorded_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stay_records: {
        Row: {
          id: string;
          reservation_id: string;
          reservation_room_id: string;
          room_id: string;
          checked_in_at: string;
          checked_in_by: string | null;
          checked_out_at: string | null;
          checked_out_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          reservation_room_id: string;
          room_id: string;
          checked_in_at?: string;
          checked_in_by?: string | null;
          checked_out_at?: string | null;
          checked_out_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          reservation_room_id?: string;
          room_id?: string;
          checked_in_at?: string;
          checked_in_by?: string | null;
          checked_out_at?: string | null;
          checked_out_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      housekeeping_tasks: {
        Row: {
          id: string;
          room_id: string;
          reservation_id: string | null;
          task_type: HousekeepingTaskType;
          status: HousekeepingStatus;
          assigned_to: string | null;
          notes: string | null;
          created_by: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          reservation_id?: string | null;
          task_type?: HousekeepingTaskType;
          status?: HousekeepingStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_by?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          reservation_id?: string | null;
          task_type?: HousekeepingTaskType;
          status?: HousekeepingStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_by?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_applicable_rate: {
        Args: { p_room_type_id: string; p_date: string };
        Returns: number | null;
      };
      check_room_availability: {
        Args: { p_room_id: string; p_check_in: string; p_check_out: string };
        Returns: boolean;
      };
      find_available_rooms: {
        Args: { p_room_type_id: string; p_check_in: string; p_check_out: string };
        Returns: Database["public"]["Tables"]["rooms"]["Row"][];
      };
      create_reservation: {
        Args: {
          p_room_type_id: string;
          p_check_in_date: string;
          p_check_out_date: string;
          p_adults?: number;
          p_children?: number;
          p_room_count?: number;
          p_special_requests?: string | null;
          p_guest_id?: string | null;
        };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
      confirm_reservation: {
        Args: { p_reservation_id: string };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
      cancel_reservation: {
        Args: { p_reservation_id: string; p_reason?: string | null };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
      allocate_room: {
        Args: { p_reservation_id: string; p_room_id: string };
        Returns: Database["public"]["Tables"]["reservation_rooms"]["Row"];
      };
      release_room: {
        Args: { p_reservation_room_id: string; p_reason?: string | null };
        Returns: Database["public"]["Tables"]["reservation_rooms"]["Row"];
      };
      check_in_reservation: {
        Args: { p_reservation_id: string };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
      check_out_reservation: {
        Args: { p_reservation_id: string };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
      report_occupancy: {
        Args: { p_from: string; p_to: string };
        Returns: Json;
      };
      report_revenue: {
        Args: { p_from: string; p_to: string };
        Returns: Json;
      };
    };
    Enums: {
      reservation_status: ReservationStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      occupancy_status: OccupancyStatus;
      housekeeping_status: HousekeepingStatus;
      housekeeping_task_type: HousekeepingTaskType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
