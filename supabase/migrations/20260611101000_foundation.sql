create table if not exists public.market_snapshots (
  id text primary key,
  snapshot_date date not null,
  title text not null,
  summary text not null,
  market_document_id text references public.market_documents(id) on delete set null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_hypotheses (
  id text primary key,
  title text not null,
  status text not null,
  origin text not null default 'generated',
  alpha_score int,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hypothesis_evidence (
  id text primary key,
  hypothesis_id text not null references public.generated_hypotheses(id) on delete cascade,
  source_type text not null,
  source_name text not null,
  confidence float not null,
  impact_score float not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategy_candidates (
  id text primary key,
  hypothesis_id text not null,
  status text not null,
  pipeline_stage text not null,
  score int not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.critic_reports (
  id text primary key,
  overall_status text not null,
  score int not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_reports (
  id text primary key,
  title text not null,
  report_type text not null,
  tone text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.embedding_jobs (
  id text primary key,
  status text not null,
  retry_count int not null default 0,
  last_error text,
  vector_record_id text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_preferences (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
