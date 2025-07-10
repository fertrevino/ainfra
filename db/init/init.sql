create table if not exists projects (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  deleted_on timestamp without time zone null,
  constraint projects_pkey primary key (id)
);

create table if not exists prompts (
  id uuid not null default gen_random_uuid (),
  project_id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  role text not null,
  content text not null,
  constraint prompts_pkey primary key (id),
  constraint prompts_project_id_fkey foreign KEY (project_id) references projects (id),
  constraint prompts_role_check check (
    (
      role = any (array['user'::text, 'assistant'::text])
    )
  )
);

create table infra_plans (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  project_id uuid not null default gen_random_uuid (),
  ir_json jsonb null,
  tf_zip_data bytea null;
  clouds text[] null,
  status text not null default '''generated'''::text,
  cost_estimate numeric null,
  applied_at timestamp with time zone null,
  constraint infra_plans_pkey primary key (id),
  constraint infra_plans_project_id_fkey foreign KEY (project_id) references projects (id),
  constraint chk_plan_status check (
    (
      status = any (
        array[
        'generated'::text,
        'applied'::text,
        'failed'::text,
        'planned'::text,
        'plan_failed'::text,
        'apply_failed'::text,
        'destroyed'::text,
        'destroy_failed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_plan_project_created on public.infra_plans using btree (project_id, created_at desc) TABLESPACE pg_default;

create unique INDEX IF not exists uniq_project_applied_plan on public.infra_plans using btree (project_id) TABLESPACE pg_default
where
  (status = 'applied'::text);

create table project_secrets (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  project_id uuid null,
  access_key text not null,
  secret_access_key text null,
  constraint project_secrets_pkey primary key (id),
  constraint project_secrets_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE
) TABLESPACE pg_default;

create table cloud_credentials (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  provider text not null,
  name text not null,
  credentials jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint cloud_credentials_pkey primary key (id),
  constraint cloud_credentials_user_id_name_key unique (user_id, name),
  constraint cloud_credentials_provider_check check (
    (
      provider = any (array['aws'::text, 'azure'::text, 'gcp'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_cloud_credentials_is_active on public.cloud_credentials using btree (is_active) TABLESPACE pg_default;

create index IF not exists idx_cloud_credentials_provider on public.cloud_credentials using btree (provider) TABLESPACE pg_default;

create index IF not exists idx_cloud_credentials_user_id on public.cloud_credentials using btree (user_id) TABLESPACE pg_default;

create trigger update_cloud_credentials_updated_at BEFORE
update on cloud_credentials for EACH row
execute FUNCTION update_updated_at_column ();
