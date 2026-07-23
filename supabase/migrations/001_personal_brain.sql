-- Optional Supabase schema for Personal Brain MVP (best-effort sync).
-- Apply in Supabase SQL editor when using cloud persistence.

create table if not exists pending_captures (
  id text primary key,
  workspace_id text not null,
  title text,
  status text,
  created_at timestamptz
);

create table if not exists knowledge_artifacts (
  id text primary key,
  workspace_id text not null,
  title text,
  markdown text,
  source text,
  tags jsonb,
  created_at timestamptz
);
