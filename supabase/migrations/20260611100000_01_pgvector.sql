create extension if not exists vector;

create table if not exists public.market_documents (
  id text primary key,
  document_type text not null check (
    document_type in (
      'snapshot',
      'news',
      'narrative',
      'technical',
      'sentiment',
      'category',
      'research'
    )
  ),
  title text not null,
  content text not null,
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_embeddings (
  id text primary key,
  document_id text not null references public.market_documents(id) on delete cascade,
  embedding vector(1536),
  model text not null,
  provider text not null,
  dimensions int not null default 1536,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists market_embeddings_document_id_idx
  on public.market_embeddings(document_id);

create index if not exists market_documents_document_type_idx
  on public.market_documents(document_type);

create index if not exists market_embeddings_embedding_hnsw_idx
  on public.market_embeddings
  using hnsw (embedding vector_cosine_ops);

create or replace function public.match_market_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_document_type text default null
)
returns table (
  id text,
  document_type text,
  title text,
  content text,
  source_ref text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    d.id,
    d.document_type,
    d.title,
    d.content,
    d.source_ref,
    d.metadata,
    1 - (e.embedding <=> query_embedding) as similarity
  from public.market_documents d
  join public.market_embeddings e on e.document_id = d.id
  where
    e.embedding is not null
    and (filter_document_type is null or d.document_type = filter_document_type)
    and 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;
