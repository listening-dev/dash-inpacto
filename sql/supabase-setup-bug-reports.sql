-- ============================================================
-- SETUP: Sistema de Bug Reports — Dashboard In.Pacto
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de Bug Reports (schema inpacto)
CREATE TABLE IF NOT EXISTS inpacto.bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT NOT NULL DEFAULT 'desconhecido',
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  page_url TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes para consultas por status e data
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON inpacto.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created ON inpacto.bug_reports(created_at DESC);

-- 2. RLS (Row Level Security)
ALTER TABLE inpacto.bug_reports ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem inserir reports
CREATE POLICY "Users can insert bug reports"
  ON inpacto.bug_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Usuários podem ver seus próprios reports
CREATE POLICY "Users can view own bug reports"
  ON inpacto.bug_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Storage Bucket para imagens dos reports
-- Execute no SQL Editor OU crie manualmente em Storage > New Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-reports', 'bug-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Auth users can upload bug report images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bug-reports');

CREATE POLICY "Anyone can view bug report images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'bug-reports');
