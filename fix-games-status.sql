-- Исправление статусов игр в базе данных
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Обновляем игры со статусом "waiting" на "playing" (для игр против AI)
UPDATE games 
SET status = 'playing' 
WHERE status = 'waiting' AND player_o IS NULL;

-- 2. Обновляем игры с победителями на "completed"
UPDATE games 
SET status = 'completed' 
WHERE status = 'playing' AND winner IS NOT NULL AND winner != '';

-- 3. Обновляем игры с полной доской (ничья) на "completed"
UPDATE games 
SET status = 'completed', winner = 'draw' 
WHERE status = 'playing' 
AND board IS NOT NULL 
AND NOT (board::text LIKE '%null%')
AND winner IS NULL;

-- 4. Проверяем результат
SELECT status, COUNT(*) as count 
FROM games 
GROUP BY status 
ORDER BY status;

-- 5. Показываем примеры игр для проверки
SELECT id, status, winner, created_at, player_x, player_o, board
FROM games 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Показываем игры которые все еще в статусе "playing"
SELECT id, status, winner, created_at, player_x, player_o, board
FROM games 
WHERE status = 'playing'
ORDER BY created_at DESC; 