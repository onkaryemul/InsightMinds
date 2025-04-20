-- -- Create profiles table for both therapists and clients
-- create table profiles (
--   id uuid references auth.users on delete cascade primary key,
--   email text unique not null,
--   full_name text not null,
--   role text check (role in ('therapist', 'client')) not null,
--   created_at timestamp with time zone default now(),
--   updated_at timestamp with time zone default now()
-- );

-- -- Create clients table (replacing therapist_client_relationships)
-- create table clients (
--   id uuid default uuid_generate_v4() primary key,
--   profile_id uuid references profiles(id) on delete cascade,
--   therapist_id uuid references profiles(id) on delete cascade,
--   phone_number text,
--   is_high_risk boolean default false,
--   status text check (status in ('active', 'archived')) default 'active',
--   notes text,
--   created_at timestamp with time zone default now(),
--   updated_at timestamp with time zone default now(),
--   -- Ensure unique profile-therapist pairs
--   unique(profile_id, therapist_id)
-- );

-- -- Create sessions table
-- create table sessions (
--   id uuid default uuid_generate_v4() primary key,
--   therapist_id uuid references profiles(id) on delete cascade,
--   client_id uuid references clients(id) on delete cascade,
--   title text,
--   session_type text check (session_type in ('individual', 'couple')) not null,
--   note_type text check (note_type in ('SOAP', 'DAP', 'BIRP')) not null,
--   primary_treatment_approach text check (
--     primary_treatment_approach in (
--       'CBT', 
--       'DBT', 
--       'psychodynamic',
--       'person_centered',
--       'solution_focused',
--       'narrative',
--       'gestalt',
--       'existential',
--       'other'
--     )
--   ) not null,
--   setting text check (setting in ('in_person', 'telehealth')) not null,
--   session_date timestamp with time zone not null,
--   recording_time integer, -- in minutes
--   status text check (status in ('scheduled', 'completed', 'cancelled', 'in_progress')) not null,
--   notes text,
--   clinician_summary text,
--   client_summary text,
--   recording_url text,
--   recording_transcription text,
--   created_at timestamp with time zone default now(),
--   updated_at timestamp with time zone default now()
-- );

-- -- Enable RLS (Row Level Security)
-- alter table profiles enable row level security;
-- alter table clients enable row level security;
-- alter table sessions enable row level security;

-- -- Create policies
-- -- Profiles policies
-- create policy "Users can view their own profile"
--   on profiles for select
--   using (auth.uid() = id);

-- create policy "Users can update their own profile"
--   on profiles for update
--   using (auth.uid() = id);

-- -- Clients policies
-- create policy "Therapists can view their clients"
--   on clients for select
--   using (auth.uid() = therapist_id);

-- create policy "Therapists can manage their clients"
--   on clients for all
--   using (auth.uid() = therapist_id);

-- -- Sessions policies
-- create policy "Therapists can view their sessions"
--   on sessions for select
--   using (auth.uid() = therapist_id);

-- create policy "Clients can view their sessions"
--   on sessions for select
--   using (
--     exists (
--       select 1 from clients
--       where clients.id = sessions.client_id
--       and clients.profile_id = auth.uid()
--     )
--   );

-- create policy "Therapists can manage their sessions"
--   on sessions for all
--   using (auth.uid() = therapist_id); 


create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text not null,
  role text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check (
    (
      role = any (array['therapist'::text, 'client'::text])
    )
  )
) TABLESPACE pg_default;


create table public.clients (
  id uuid not null default gen_random_uuid (),
  profile_id uuid null,
  therapist_id uuid null,
  phone_number text null,
  is_high_risk boolean null default false,
  status text null default 'active'::text,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  pronouns text not null,
  constraint clients_pkey primary key (id),
  constraint clients_profile_id_therapist_id_key unique (profile_id, therapist_id),
  constraint clients_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete CASCADE,
  constraint clients_therapist_id_fkey foreign KEY (therapist_id) references profiles (id) on delete CASCADE,
  constraint clients_status_check check (
    (
      status = any (array['active'::text, 'archived'::text])
    )
  )
) TABLESPACE pg_default;


create table public.sessions (
  id uuid not null default gen_random_uuid (),
  therapist_id uuid null,
  client_id uuid null,
  title text null,
  session_type text not null,
  note_type text not null,
  primary_treatment_approach text not null,
  setting text not null,
  session_date timestamp with time zone not null,
  recording_time integer null,
  status text not null,
  notes text null,
  clinician_summary text null,
  client_summary text null,
  recording_url text null,
  recording_transcription text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint sessions_pkey primary key (id),
  constraint sessions_client_id_fkey foreign KEY (client_id) references clients (id) on delete CASCADE,
  constraint sessions_therapist_id_fkey foreign KEY (therapist_id) references profiles (id) on delete CASCADE,
  constraint sessions_primary_treatment_approach_check check (
    (
      primary_treatment_approach = any (
        array[
          'CBT'::text,
          'DBT'::text,
          'psychodynamic'::text,
          'person_centered'::text,
          'solution_focused'::text,
          'narrative'::text,
          'gestalt'::text,
          'existential'::text,
          'other'::text
        ]
      )
    )
  ),
  constraint sessions_session_type_check check (
    (
      session_type = any (array['individual'::text, 'couple'::text])
    )
  ),
  constraint sessions_setting_check check (
    (
      setting = any (array['in_person'::text, 'telehealth'::text])
    )
  ),
  constraint sessions_status_check check (
    (
      status = any (
        array[
          'scheduled'::text,
          'completed'::text,
          'cancelled'::text,
          'in_progress'::text
        ]
      )
    )
  ),
  constraint sessions_note_type_check check (
    (
      note_type = any (array['SOAP'::text, 'DAP'::text, 'BIRP'::text])
    )
  )
) TABLESPACE pg_default;


create table public.messages (
  id uuid not null default gen_random_uuid (),
  client_id uuid not null,
  text_message text null,
  recording_url text null,
  emotions text null,
  message_type text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  event_date timestamp with time zone not null,
  constraint messages_pkey primary key (id),
  constraint unique_event_date unique (event_date),
  constraint messages_client_id_fkey foreign KEY (client_id) references clients (id) on delete CASCADE,
  constraint messages_message_type_check check (
    (
      message_type = any (array['text'::text, 'recording'::text])
    )
  )
) TABLESPACE pg_default;


create table public.goals (
  id serial not null,
  client_id uuid not null,
  goal text not null,
  target integer not null,
  target_duration text not null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint goals_pkey primary key (id),
  constraint goals_client_id_fkey foreign KEY (client_id) references clients (id) on delete CASCADE,
  constraint goals_target_duration_check check (
    (
      target_duration = any (array['daily'::text, 'weekly'::text])
    )
  )
) TABLESPACE pg_default;


create table public.coping_mechanisms (
  id serial not null,
  client_id uuid null,
  mechanism text not null,
  created_at timestamp without time zone null default now(),
  constraint coping_mechanisms_pkey primary key (id),
  constraint coping_mechanisms_client_id_fkey foreign KEY (client_id) references clients (id) on delete CASCADE
) TABLESPACE pg_default;
