// Mirrors supabase/migrations/0001_init.sql

export type ResearchStatus =
  | "not_researched"
  | "researching"
  | "researched"
  | "failed"
  | "needs_update";

export type LeadStatus =
  | "potential_prospect"
  | "contacted"
  | "qualified"
  | "disqualified";

export type DecisionMakerStatus = "confirmed" | "not_confirmed" | "unknown";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface OtherUrl {
  label: string;
  url: string;
}

export interface Company {
  id: string;
  user_id: string;

  name: string;
  website_url: string | null;
  google_maps_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  other_urls: OtherUrl[];
  notes: string | null;

  description: string | null;
  industry: string | null;
  business_type: string | null;
  company_size: string | null;
  location_city: string | null;
  location_state: string | null;
  markets_served: string[];
  services_offered: string[];
  business_model: string | null;
  public_contact_email: string | null;
  public_contact_phone: string | null;
  relevant_keywords: string[];
  potential_services: string[];

  ai_summary: string | null;
  potential_need: string | null;
  lead_status: LeadStatus;
  decision_maker_status: DecisionMakerStatus;
  best_available_contact: string | null;
  recommended_action: string | null;

  research_status: ResearchStatus;
  last_researched_at: string | null;
  manually_edited_fields: string[];

  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  user_id: string;

  full_name: string;
  job_title: string | null;
  linkedin_url: string | null;
  public_email: string | null;
  company_email: string | null;
  phone: string | null;
  source_url: string | null;
  confidence_level: ConfidenceLevel;
  relationship_to_company: string | null;

  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  company_id: string;
  user_id: string;
  description: string | null;
  status: "open" | "pursuing" | "won" | "lost" | "dismissed";
  recommended_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchRun {
  id: string;
  company_id: string;
  user_id: string;
  sources_used: { type: string; url: string }[];
  raw_extracted_data: Record<string, unknown> | null;
  status: "pending" | "running" | "done" | "failed";
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  category:
    | "industry"
    | "state"
    | "city"
    | "market"
    | "service"
    | "need"
    | "role"
    | "lead_status"
    | "research_status"
    | "decision_maker";
}
