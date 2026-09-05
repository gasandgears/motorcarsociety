create table if not exists public.accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique, display_name text not null default '', phone text not null default '', location text not null default '', collection_notes text not null default '',
  role text not null default 'applicant', tier text not null default 'none', status text not null default 'pending', created_at bigint not null, updated_at bigint not null
);
create table if not exists public.cars (
  id uuid primary key, created_by uuid not null, created_by_email text not null, year text not null, make text not null, model text not null,
  seller_name text not null, seller_phone text not null, expected_price text not null, seller_email text not null default '', location text not null default '', vin text not null default '', notes text not null default '',
  exterior_color text not null default '', interior_color text not null default '', mileage text not null default '', body_style text not null default '', engine text not null default '', transmission text not null default '', drivetrain text not null default '',
  registry_id text not null unique, category text not null default 'Uncategorized', short_description text not null default '', overview text not null default '', highlights text not null default '', condition_summary text not null default '', provenance text not null default '', restoration_summary text not null default '',
  received_categories text not null default '', visibility text not null default 'private', status text not null default 'intake', created_at bigint not null, updated_at bigint not null
);
create index if not exists cars_category_status_idx on public.cars(category,status);
create index if not exists cars_updated_idx on public.cars(updated_at desc);
create table if not exists public.car_files (
  id uuid primary key, car_id uuid not null references public.cars(id) on delete cascade, storage_key text not null unique, filename text not null, content_type text not null, size_bytes bigint not null,
  category text not null, uploaded_by uuid not null, uploaded_by_email text not null, sort_order bigint not null default 0, created_at bigint not null
);
create index if not exists car_files_car_idx on public.car_files(car_id,sort_order);
create table if not exists public.w_your_profiles (
  id uuid primary key, user_id uuid not null references public.accounts(user_id) on delete cascade, marques text not null default '', specific_car text not null default '', value_range text not null default '', acquisition_low text not null default '', acquisition_high text not null default '', era text not null default '', primary_interest text not null default '', created_at bigint not null, updated_at bigint not null
);
create table if not exists public.wanted_vehicles (
  id uuid primary key, user_id uuid not null references public.accounts(user_id) on delete cascade, year text not null default '', make text not null default '', model text not null default '', variant text not null default '', acquisition_low text not null default '', acquisition_high text not null default '', notes text not null default '', status text not null default 'active', created_at bigint not null, updated_at bigint not null
);
create index if not exists wanted_user_idx on public.wanted_vehicles(user_id,status);
create index if not exists wanted_make_model_idx on public.wanted_vehicles(make,model);
create table if not exists public.car_task_states (
  id uuid primary key, car_id uuid not null references public.cars(id) on delete cascade, task_key text not null, status text not null, due_at bigint not null, snooze_count integer not null default 0, completed_at bigint, updated_at bigint not null, unique(car_id,task_key)
);
create table if not exists public.dossier_requests (
  id uuid primary key, car_id uuid not null references public.cars(id) on delete cascade, requester_user_id uuid not null references public.accounts(user_id) on delete cascade, requester_email text not null, status text not null default 'new', created_at bigint not null, updated_at bigint not null, unique(car_id,requester_user_id)
);
create table if not exists public.mailing_contacts (
  id uuid primary key, email text not null unique, display_name text not null default '', phone text not null default '', source text not null default '', permission text not null default 'needs_review', invite_status text not null default 'not_sent', unsubscribed_at bigint, created_at bigint not null, updated_at bigint not null
);
insert into storage.buckets (id,name,public,file_size_limit) values ('vehicle-files','vehicle-files',false,157286400) on conflict (id) do update set file_size_limit=excluded.file_size_limit;
alter table public.accounts enable row level security;
alter table public.cars enable row level security;
alter table public.car_files enable row level security;
alter table public.wanted_vehicles enable row level security;
alter table public.car_task_states enable row level security;
alter table public.dossier_requests enable row level security;
alter table public.mailing_contacts enable row level security;
