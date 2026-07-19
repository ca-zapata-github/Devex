-- 0003_app_meta — sample-data banner flag + future app settings.
-- Apply via: npm run db:deploy:devex

create table if not exists devex.app_meta (
  key   text primary key,
  value jsonb not null
);

insert into devex.app_meta (key, value)
values ('sample_data_banner', 'true'::jsonb)
on conflict (key) do nothing;

grant select on devex.app_meta to anon, authenticated;
grant all on devex.app_meta to service_role;

alter table devex.app_meta enable row level security;

drop policy if exists app_meta_select on devex.app_meta;
create policy app_meta_select on devex.app_meta
  for select to anon, authenticated using (true);
