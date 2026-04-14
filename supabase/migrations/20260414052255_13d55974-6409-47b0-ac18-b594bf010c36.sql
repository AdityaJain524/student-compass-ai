
-- User activity tracking
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  page text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own activity" ON public.user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own activity" ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);

-- AI generated content
CREATE TABLE public.ai_generated_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content_type text NOT NULL DEFAULT 'blog',
  topic text,
  country text,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own content" ON public.ai_generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own content" ON public.ai_generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own content" ON public.ai_generated_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own content" ON public.ai_generated_content FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_ai_content_updated_at BEFORE UPDATE ON public.ai_generated_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recommendations
CREATE TABLE public.recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  rec_type text NOT NULL DEFAULT 'university',
  title text NOT NULL,
  description text,
  link text,
  score numeric DEFAULT 0,
  dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own recs" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own recs" ON public.recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users create own recs" ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_recommendations_user ON public.recommendations(user_id);
