alter table public.accounts alter column role set default 'member';
alter table public.accounts alter column tier set default 'free';
alter table public.accounts alter column status set default 'approved';

update public.accounts
set role = 'member', tier = 'free', status = 'approved', updated_at = extract(epoch from now())::bigint * 1000
where role = 'applicant' and tier = 'none' and status = 'pending';
