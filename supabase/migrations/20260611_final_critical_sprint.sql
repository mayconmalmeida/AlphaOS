alter table public.generated_hypotheses
  add column if not exists why_now text,
  add column if not exists invalidating_conditions jsonb not null default '[]'::jsonb;

alter table public.market_snapshots
  add column if not exists source_mode text not null default 'fallback',
  add column if not exists source_capabilities jsonb not null default '[]'::jsonb,
  add column if not exists last_sync_at timestamptz;

alter table public.market_documents enable row level security;
alter table public.market_embeddings enable row level security;

drop policy if exists market_documents_public_all on public.market_documents;
create policy market_documents_public_all
  on public.market_documents
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists market_embeddings_public_all on public.market_embeddings;
create policy market_embeddings_public_all
  on public.market_embeddings
  for all
  to anon, authenticated
  using (true)
  with check (true);

create index if not exists generated_hypotheses_why_now_idx
  on public.generated_hypotheses using gin (to_tsvector('english', coalesce(why_now, '')));

create index if not exists market_snapshots_last_sync_idx
  on public.market_snapshots(last_sync_at desc);
