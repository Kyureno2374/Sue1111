-- Удаление полей platform fee из базы данных
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Удаляем поля platform fee из таблицы system_settings
ALTER TABLE system_settings 
DROP COLUMN IF EXISTS platform_fee,
DROP COLUMN IF EXISTS platform_fee_vs_bot,
DROP COLUMN IF EXISTS platform_fee_vs_player;

-- 2. Проверяем структуру таблицы system_settings
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'system_settings' 
ORDER BY ordinal_position;

-- 3. Проверяем что поля удалены
SELECT * FROM system_settings LIMIT 1; 