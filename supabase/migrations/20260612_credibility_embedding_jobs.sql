alter table public.embedding_jobs
  add column if not exists document_id text,
  add column if not exists document_type text,
  add column if not exists attempts int not null default 0,
  add column if not exists embedding_model text,
  add column if not exists vector_dimension int,
  add column if not exists source_mode text not null default 'fallback',
  add column if not exists completed_at timestamptz;

create index if not exists embedding_jobs_status_idx
  on public.embedding_jobs(status);

create index if not exists embedding_jobs_document_type_idx
  on public.embedding_jobs(document_type);

create index if not exists embedding_jobs_created_at_idx
  on public.embedding_jobs(created_at desc);

create index if not exists embedding_jobs_document_id_idx
  on public.embedding_jobs(document_id);
