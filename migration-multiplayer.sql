-- Миграция для добавления поддержки мультиплеера
-- Добавляем новые поля в таблицу games

-- Добавляем поле для типа игры (ai/multiplayer)
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_type VARCHAR(10) DEFAULT 'ai';

-- Добавляем поле для второго игрока (если его нет)
ALTER TABLE games ADD COLUMN IF NOT EXISTS player_o_id UUID REFERENCES users(id);

-- Добавляем поле для времени последней активности
ALTER TABLE games ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW();

-- Добавляем поле для времени завершения игры
ALTER TABLE games ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;

-- Обновляем существующие игры, устанавливая тип 'ai' для игр против ИИ
UPDATE games 
SET game_type = 'ai' 
WHERE game_type IS NULL OR game_type = '';

-- Создаем индекс для быстрого поиска игр по статусу и типу
CREATE INDEX IF NOT EXISTS idx_games_status_type ON games(status, game_type);

-- Создаем индекс для поиска игр по времени создания
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- Создаем индекс для поиска игр по ставке
CREATE INDEX IF NOT EXISTS idx_games_bet_amount ON games(bet_amount);

-- Обновляем существующие игры, устанавливая player_o_id = player_o если player_o не null
UPDATE games 
SET player_o_id = player_o 
WHERE player_o IS NOT NULL AND player_o_id IS NULL;

-- Добавляем ограничение для проверки валидности типа игры
ALTER TABLE games ADD CONSTRAINT check_game_type 
CHECK (game_type IN ('ai', 'multiplayer'));

-- Добавляем комментарии к таблице
COMMENT ON COLUMN games.game_type IS 'Тип игры: ai - против ИИ, multiplayer - против игрока';
COMMENT ON COLUMN games.player_o_id IS 'ID второго игрока (для мультиплеера)';
COMMENT ON COLUMN games.last_activity IS 'Время последней активности в игре';
COMMENT ON COLUMN games.ended_at IS 'Время завершения игры';

-- Создаем представление для лобби (доступные игры)
CREATE OR REPLACE VIEW lobby_games AS
SELECT 
    g.id,
    g.status,
    g.bet_amount,
    g.pot,
    g.created_at,
    g.player_x,
    g.player_o,
    g.game_type,
    g.players,
    u.username as creator_username,
    u.avatar as creator_avatar
FROM games g
LEFT JOIN users u ON g.player_x = u.id
WHERE g.status IN ('waiting', 'playing')
  AND g.game_type = 'multiplayer'
ORDER BY g.created_at DESC;

-- Создаем функцию для очистки старых игр
CREATE OR REPLACE FUNCTION cleanup_old_games()
RETURNS void AS $$
BEGIN
    -- Удаляем игры старше 24 часов со статусом 'waiting'
    DELETE FROM games 
    WHERE status = 'waiting' 
      AND created_at < NOW() - INTERVAL '24 hours';
    
    -- Обновляем время последней активности для активных игр
    UPDATE games 
    SET last_activity = NOW() 
    WHERE status = 'playing' 
      AND last_activity < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления last_activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_activity
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_last_activity();

-- Добавляем статистику мультиплеера в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS multiplayer_games_played INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS multiplayer_games_won INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS multiplayer_total_winnings DECIMAL(10,2) DEFAULT 0;

-- Создаем функцию для обновления статистики мультиплеера
CREATE OR REPLACE FUNCTION update_multiplayer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Если игра завершена и есть победитель
    IF NEW.status = 'completed' AND NEW.winner IS NOT NULL THEN
        -- Обновляем статистику победителя
        UPDATE users 
        SET 
            multiplayer_games_played = multiplayer_games_played + 1,
            multiplayer_games_won = multiplayer_games_won + 1,
            multiplayer_total_winnings = multiplayer_total_winnings + NEW.pot
        WHERE id = NEW.winner_user_id;
        
        -- Обновляем статистику проигравшего
        UPDATE users 
        SET multiplayer_games_played = multiplayer_games_played + 1
        WHERE id IN (NEW.player_x, NEW.player_o)
          AND id != NEW.winner_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления статистики
CREATE TRIGGER trigger_update_multiplayer_stats
    AFTER UPDATE ON games
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_multiplayer_stats();

-- Добавляем комментарии к новым полям в users
COMMENT ON COLUMN users.multiplayer_games_played IS 'Количество игр в мультиплеере';
COMMENT ON COLUMN users.multiplayer_games_won IS 'Количество побед в мультиплеере';
COMMENT ON COLUMN users.multiplayer_total_winnings IS 'Общий выигрыш в мультиплеере'; 