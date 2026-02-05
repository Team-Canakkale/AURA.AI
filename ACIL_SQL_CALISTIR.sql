-- ACIL: BU KODU SUPABASE DASHBOARD > SQL EDITOR KISMINA YAPIŞTIR VE ÇALIŞTIR
-- BU KOD, TÜM GÜVENLİK CONTROLLARINI KAPATIR VE HERKESİN YAZMASINA İZİN VERİR.
-- AYRICA 'user_id' ZORUNLULUĞUNU KALDIRIR (Foreign Key iptal edilir).

-- 1. RLS'i Kapat
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- 2. Foreign Key Constraint'i Kaldır (Adı 'tasks_user_id_fkey' olabilir, kontrol et)
-- Eğer hata verirse constraint adını bulman gerekebilir ama genelde budur.
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- 3. (Opsiyonel) user_id kolonunu NULL olabilir yap (İhtiyaç olursa)
ALTER TABLE tasks ALTER COLUMN user_id DROP NOT NULL;
