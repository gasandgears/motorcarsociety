create table public.coming_soon_previews (
  car_id uuid primary key references public.cars(id) on delete cascade,
  public_title text not null,
  cover_file_id uuid not null references public.car_files(id) on delete cascade,
  enabled boolean not null default false,
  updated_at bigint not null
);
create table public.car_inquiries (
  id text primary key,
  car_id uuid not null references public.cars(id) on delete cascade,
  car_title text not null,
  name text not null,
  email text not null,
  phone text not null,
  ip_hash text not null,
  notification_status text not null default 'pending',
  consented_at bigint not null,
  created_at bigint not null,
  notified_at bigint
);
create index car_inquiries_ip_created on public.car_inquiries(ip_hash,created_at);
create index car_inquiries_email_created on public.car_inquiries(email,created_at);
create index car_inquiries_car_created on public.car_inquiries(car_id,created_at);
alter table public.coming_soon_previews enable row level security;
alter table public.car_inquiries enable row level security;
revoke all on public.coming_soon_previews,public.car_inquiries from anon, authenticated;
grant all on public.coming_soon_previews,public.car_inquiries to service_role;
