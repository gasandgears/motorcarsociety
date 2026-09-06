create table if not exists public.admin_record_notes (
  id uuid primary key,
  record_type text not null,
  record_id text not null,
  note text not null,
  author_id text not null,
  author_email text not null,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists admin_record_notes_record_created_idx on public.admin_record_notes(record_type, record_id, created_at desc);
alter table public.admin_record_notes enable row level security;
