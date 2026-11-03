create table public.newsletter_signup_attempts (
  id text primary key,
  ip_hash text not null,
  created_at bigint not null
);
create index newsletter_signup_attempts_ip_created on public.newsletter_signup_attempts(ip_hash,created_at);
alter table public.newsletter_signup_attempts enable row level security;
revoke all on public.newsletter_signup_attempts from anon, authenticated;
grant all on public.newsletter_signup_attempts to service_role;
