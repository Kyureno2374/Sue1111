-- Исправление данных пользователей с null значениями
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Проверяем пользователей с null значениями
SELECT id, username, balance, games_played, games_won, total_winnings
FROM users 
WHERE balance IS NULL 
   OR games_played IS NULL 
   OR games_won IS NULL 
   OR total_winnings IS NULL;

-- 2. Исправляем null значения на 0
UPDATE users 
SET 
  balance = COALESCE(balance, 0),
  games_played = COALESCE(games_played, 0),
  games_won = COALESCE(games_won, 0),
  total_winnings = COALESCE(total_winnings, 0)
WHERE balance IS NULL 
   OR games_played IS NULL 
   OR games_won IS NULL 
   OR total_winnings IS NULL;

-- 3. Проверяем результат
SELECT id, username, balance, games_played, games_won, total_winnings
FROM users 
WHERE id = 'f3c1999b-c49c-4720-aad4-6ba9c7caf8b3';

-- 4. Проверяем, что все пользователи имеют корректные значения
SELECT COUNT(*) as total_users,
       COUNT(CASE WHEN balance IS NULL THEN 1 END) as null_balance,
       COUNT(CASE WHEN games_played IS NULL THEN 1 END) as null_games_played,
       COUNT(CASE WHEN games_won IS NULL THEN 1 END) as null_games_won,
       COUNT(CASE WHEN total_winnings IS NULL THEN 1 END) as null_total_winnings
FROM users; 