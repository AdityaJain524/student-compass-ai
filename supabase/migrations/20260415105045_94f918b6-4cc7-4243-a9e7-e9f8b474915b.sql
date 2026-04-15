
-- Marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  target_audience TEXT NOT NULL DEFAULT 'students',
  country TEXT,
  goal TEXT NOT NULL DEFAULT 'awareness',
  email_content TEXT,
  linkedin_content TEXT,
  instagram_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  simulated_sent INTEGER NOT NULL DEFAULT 0,
  simulated_opens INTEGER NOT NULL DEFAULT 0,
  simulated_clicks INTEGER NOT NULL DEFAULT 0,
  simulated_conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own campaigns" ON public.marketing_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own campaigns" ON public.marketing_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own campaigns" ON public.marketing_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own campaigns" ON public.marketing_campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI agent logs table
CREATE TABLE public.ai_agent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own agent logs" ON public.ai_agent_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own agent logs" ON public.ai_agent_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
