export interface Booking {
  id: string;
  created_at: string;
  service_date: string;
  service_time: string;
  address: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  window_count: number;
  total_price: number;
  needs_estimate: boolean;
  status: string;
}

export interface BlockedSlot {
  id: string;
  date: string;
  time_slot: string | null;
  reason: string | null;
}
