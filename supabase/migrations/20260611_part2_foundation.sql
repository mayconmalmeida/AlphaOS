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

create index if not exists market_snapshots_snapshot_date_idx
  on public.market_snapshots(snapshot_date desc);

create index if not exists hypothesis_evidence_hypothesis_id_idx
  on public.hypothesis_evidence(hypothesis_id);

create index if not exists strategy_candidates_hypothesis_id_idx
  on public.strategy_candidates(hypothesis_id);

alter table public.market_snapshots enable row level security;
alter table public.generated_hypotheses enable row level security;
alter table public.hypothesis_evidence enable row level security;
alter table public.strategy_candidates enable row level security;
alter table public.critic_reports enable row level security;
alter table public.research_reports enable row level security;
alter table public.embedding_jobs enable row level security;
alter table public.workspace_preferences enable row level security;

drop policy if exists market_snapshots_public_all on public.market_snapshots;
create policy market_snapshots_public_all
  on public.market_snapshots
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists generated_hypotheses_public_all on public.generated_hypotheses;
create policy generated_hypotheses_public_all
  on public.generated_hypotheses
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists hypothesis_evidence_public_all on public.hypothesis_evidence;
create policy hypothesis_evidence_public_all
  on public.hypothesis_evidence
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists strategy_candidates_public_all on public.strategy_candidates;
create policy strategy_candidates_public_all
  on public.strategy_candidates
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists critic_reports_public_all on public.critic_reports;
create policy critic_reports_public_all
  on public.critic_reports
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists research_reports_public_all on public.research_reports;
create policy research_reports_public_all
  on public.research_reports
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists embedding_jobs_public_all on public.embedding_jobs;
create policy embedding_jobs_public_all
  on public.embedding_jobs
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists workspace_preferences_public_all on public.workspace_preferences;
create policy workspace_preferences_public_all
  on public.workspace_preferences
  for all
  to anon, authenticated
  using (true)
  with check (true);

