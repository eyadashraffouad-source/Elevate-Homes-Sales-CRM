// Mirrors supabase/migrations/0003_manual_crm_redesign.sql

export type CompanyStatus =
  | "active"
  | "prospect"
  | "customer"
  | "inactive"
  | "lost";

export type ContactStatus =
  | "active"
  | "follow_up"
  | "unresponsive"
  | "inactive";

export type JobTitle =
  | "Sales Manager"
  | "Owner"
  | "CEO"
  | "Founder"
  | "Acquisitions Manager"
  | "Investor"
  | "Partner"
  | "Broker"
  | "Other";

export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  company_status: CompanyStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  company_id: string;
  full_name: string;
  job_title: JobTitle | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  contact_status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanyWithContacts extends Company {
  contacts: Contact[];
}
