
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  academic_history TEXT,
  gpa NUMERIC(4,2),
  interests TEXT[],
  preferred_countries TEXT[],
  budget_min NUMERIC,
  budget_max NUMERIC,
  test_scores JSONB DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Universities table
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  ranking INT,
  acceptance_rate NUMERIC(5,2),
  tuition_min NUMERIC,
  tuition_max NUMERIC,
  courses TEXT[],
  requirements JSONB DEFAULT '{}',
  website TEXT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities readable by everyone" ON public.universities FOR SELECT USING (true);

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id UUID REFERENCES public.universities(id),
  university_name TEXT NOT NULL,
  course TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','waitlisted')),
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own applications" ON public.applications FOR DELETE USING (auth.uid() = user_id);

-- Loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC(5,2),
  tenure_months INT,
  emi NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','applied','approved','rejected','disbursed')),
  collateral_type TEXT,
  documents_submitted TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own loans" ON public.loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own loans" ON public.loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own loans" ON public.loans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own loans" ON public.loans FOR DELETE USING (auth.uid() = user_id);

-- Chat history table
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own chats" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own chats" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gamification table
CREATE TABLE public.gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  points INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  login_streak INT NOT NULL DEFAULT 0,
  last_login_date DATE,
  referral_code TEXT UNIQUE,
  referrals_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own gamification" ON public.gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own gamification" ON public.gamification FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own gamification" ON public.gamification FOR UPDATE USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','deadline','recommendation','loan','achievement')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- SOP Drafts table
CREATE TABLE public.sop_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_name TEXT,
  course TEXT,
  prompt_context JSONB DEFAULT '{}',
  content TEXT NOT NULL DEFAULT '',
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sop_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sops" ON public.sop_drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own sops" ON public.sop_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sops" ON public.sop_drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sops" ON public.sop_drafts FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gamification_updated_at BEFORE UPDATE ON public.gamification FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sop_drafts_updated_at BEFORE UPDATE ON public.sop_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.gamification (user_id, referral_code)
  VALUES (NEW.id, substr(md5(NEW.id::text), 1, 8));
  
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (NEW.id, 'Welcome to UniPath! 🎓', 'Start exploring universities and career paths. Complete your profile to get personalized recommendations.', 'info');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
