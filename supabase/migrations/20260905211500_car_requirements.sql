create table if not exists public.car_requirements (
  id uuid primary key,
  car_id uuid not null references public.cars(id) on delete cascade,
  requirement_key text not null,
  entry_text text not null default '',
  source_file_id uuid,
  completion_method text not null default 'manual',
  updated_at bigint not null,
  unique(car_id, requirement_key)
);
create index if not exists car_requirements_car_idx on public.car_requirements(car_id);
alter table public.car_requirements enable row level security;
