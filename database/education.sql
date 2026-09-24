create table if not exists education_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  title text not null,
  subject text,
  level text,
  topic text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lesson_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  title text not null,
  subject text,
  level text,
  duration text,
  objectives text,
  activities text,
  assessment text,
  resources text,
  created_at timestamptz default now()
);

create table if not exists question_papers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  title text not null,
  subject text,
  level text,
  instructions text,
  questions text,
  answer_key text,
  created_at timestamptz default now()
);

create table if not exists grading_rubrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  title text not null,
  criteria text,
  levels text,
  created_at timestamptz default now()
);

create table if not exists curriculum_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  title text not null,
  subject text,
  level text,
  term text,
  weeks text,
  created_at timestamptz default now()
);

create table if not exists attendance_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  class_name text,
  student_name text,
  date date default current_date,
  status text default 'present',
  created_at timestamptz default now()
);

create table if not exists student_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  student_name text,
  subject text,
  assessment text,
  score numeric,
  max_score numeric,
  notes text,
  created_at timestamptz default now()
);

create table if not exists education_exports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  export_type text,
  title text,
  content text,
  created_at timestamptz default now()
);
