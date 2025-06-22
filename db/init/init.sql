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
)
