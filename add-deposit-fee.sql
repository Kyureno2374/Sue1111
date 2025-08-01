-- Добавление поля deposit_fee в таблицу system_settings
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Добавляем поле deposit_fee в таблицу system_settings
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS deposit_fee NUMERIC(5,2) DEFAULT 20.00;

-- 2. Обновляем существующие записи с дефолтным значением
UPDATE system_settings 
SET deposit_fee = 20.00 
WHERE deposit_fee IS NULL;

-- 3. Проверяем структуру таблицы system_settings
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'system_settings' 
ORDER BY ordinal_position;

-- 4. Проверяем данные
SELECT * FROM system_settings LIMIT 1; 