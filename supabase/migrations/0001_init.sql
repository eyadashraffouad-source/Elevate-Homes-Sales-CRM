-- ============================================================
-- Client Research & Intelligence CRM — Phase 1 schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- companies
-- ------------------------------------------------------------
create table companies (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references auth.users(id) on delete cascade,

  -- raw input
  name                   text not null,
  website_url            text,
  google_maps_url        text,
  linkedin_url           text,
  instagram_url          text,
  facebook_url           text,
  other_urls             jsonb default '[]'::jsonb,   -- [{label, url}]
  notes                  text,

  -- researched / structured fields
  description            text,
  industry               text,
  business_type          text,
  company_size           text,
  location_city          text,
  location_state         text,
  markets_served         text[] default '{}',
  services_offered       text[] default '{}',
  business_model         text,
  public_contact_email   text,
  public_contact_phone   text,
  relevant_keywords      text[] default '{}',
  potential_services     text[] default '{}',

  -- AI classification
  ai_summary             text,
  potential_need         text,
  lead_status            text default 'potential_prospect',
  decision_maker_status  text default 'unknown',       -- confirmed / not_confirmed / unknown
  best_available_contact text,
  recommended_action     text,

  -- workflow state
  research_status        text default 'not_researched', -- not_researched / researching / researched / failed / needs_update
  last_researched_at     timestamptz,

  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create index idx_companies_user on companies(user_id);
create index idx_companies_state on companies(location_state);
create index idx_companies_industry on companies(industry);
create index idx_companies_lead_status on companies(lead_status);
create index idx_companies_research_status on companies(research_status);

-- ------------------------------------------------------------
-- contacts
-- ------------------------------------------------------------
create table contacts (
  id                     uuid primary key default uuid_generate_v4(),
  company_id             uuid not null references companies(id) on delete cascade,
  user_id                uuid not null references auth.users(id) on delete cascade,

  full_name              text not null,
  job_title              text,
  linkedin_url           text,
  public_email           text,
  company_email          text,
  phone                  text,
  source_url             text,
  confidence_level       text default 'medium',        -- high / medium / low
  relationship_to_company text,                         -- owner / founder / sales manager / etc.

  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create index idx_contacts_company on contacts(company_id);
create index idx_contacts_role on contacts(relationship_to_company);

-- ------------------------------------------------------------
-- opportunities  (kept distinct from company + contact)
-- ------------------------------------------------------------
create table opportunities (
  id                     uuid primary key default uuid_generate_v4(),
  company_id             uuid not null references companies(id) on delete cascade,
  user_id                uuid not null references auth.users(id) on delete cascade,

  description            text,
  status                 text default 'open',           -- open / pursuing / won / lost / dismissed
  recommended_action     text,

  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create index idx_opportunities_company on opportunities(company_id);

-- ------------------------------------------------------------
-- research_runs  (audit trail — every AI research pass)
-- ------------------------------------------------------------
create table research_runs (
  id                     uuid primary key default uuid_generate_v4(),
  company_id             uuid not null references companies(id) on delete cascade,
  user_id                uuid not null references auth.users(id) on delete cascade,

  sources_used           jsonb default '[]'::jsonb,     -- [{type, url}]
  raw_extracted_data     jsonb,                          -- full model output for this run
  status                 text default 'pending',        -- pending / running / done / failed
  error_message          text,

  created_at             timestamptz default now(),
  completed_at           timestamptz
);

create index idx_research_runs_company on research_runs(company_id);

-- ------------------------------------------------------------
-- tags + company_tags  (many-to-many)
-- ------------------------------------------------------------
create table tags (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  name                   text not null,
  category               text not null,                 -- industry / state / city / market / service / need / role / lead_status / research_status / decision_maker
  unique(user_id, name, category)
);

create table company_tags (
  company_id             uuid not null references companies(id) on delete cascade,
  tag_id                 uuid not null references tags(id) on delete cascade,
  primary key (company_id, tag_id)
);

-- ------------------------------------------------------------
-- updated_at trigger helper
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_companies_updated_at before update on companies
  for each row execute function set_updated_at();
create trigger trg_contacts_updated_at before update on contacts
  for each row execute function set_updated_at();
create trigger trg_opportunities_updated_at before update on opportunities
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security — every table scoped to user_id
-- ------------------------------------------------------------
alter table companies enable row level security;
alter table contacts enable row level security;
alter table opportunities enable row level security;
alter table research_runs enable row level security;
alter table tags enable row level security;
alter table company_tags enable row level security;

create policy "companies_owner" on companies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "contacts_owner" on contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "opportunities_owner" on opportunities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "research_runs_owner" on research_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tags_owner" on tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "company_tags_owner" on company_tags
  for all using (
    exists (select 1 from companies c where c.id = company_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from companies c where c.id = company_id and c.user_id = auth.uid())
  );
