CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  grp text NOT NULL DEFAULT 'kichik' CHECK (grp IN ('kichik','orta','katta')),
  avatar text NOT NULL DEFAULT '🦊',
  xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
  streak integer NOT NULL DEFAULT 1,
  last_day date,
  games integer NOT NULL DEFAULT 0,
  daily jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read all profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE INDEX profiles_grp_xp_idx ON public.profiles (grp, xp DESC);