-- Supabase'de çalıştırılacak SQL script
-- Supabase Dashboard > SQL Editor'de çalıştırın

-- Lobbies tablosunu oluştur
CREATE TABLE IF NOT EXISTS lobbies (
  code TEXT PRIMARY KEY,
  teams JSONB NOT NULL DEFAULT '[]'::jsonb,
  waiting_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index ekle (hızlı arama için)
CREATE INDEX IF NOT EXISTS idx_lobbies_code ON lobbies(code);
CREATE INDEX IF NOT EXISTS idx_lobbies_created_at ON lobbies(created_at);

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lobbies_updated_at BEFORE UPDATE ON lobbies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Herkes okuyabilir, herkes yazabilir (lobi sistemi için)
ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;

-- Herkesin okuyabilmesi için policy
CREATE POLICY "Anyone can read lobbies" ON lobbies
    FOR SELECT USING (true);

-- Herkesin yazabilmesi için policy
CREATE POLICY "Anyone can write lobbies" ON lobbies
    FOR ALL USING (true);

