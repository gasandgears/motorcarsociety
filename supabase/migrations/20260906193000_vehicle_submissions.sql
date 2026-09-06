create table if not exists public.vehicle_submissions (
  id uuid primary key,
  name text not null,
  email text not null,
  phone text not null,
  year text not null,
  make text not null,
  model text not null,
  location text not null,
  ownership text not null,
  story text not null,
  documentation text not null default '',
  status text not null default 'new',
  consented_at bigint not null,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists vehicle_submissions_status_created_idx on public.vehicle_submissions(status, created_at desc);
alter table public.vehicle_submissions enable row level security;
