
export interface WaitlistEntry {
  id: string;
  full_name: string;
  company_name: string;
  position: string;
  email: string;
  phone: string;
  plan_type: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface WaitlistInvoice {
  id: string;
  waitlist_id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}
