-- USERS
create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    username text not null unique,
    password text not null,
    email text unique,
    wallet_address text,
    balance numeric(18,6) not null default 0,
    games_played integer not null default 0,
    games_won integer not null default 0,
    total_winnings numeric(18,6) not null default 0,
    avatar text,
    is_admin boolean not null default false,
    status text not null default 'active' check (status in ('active', 'banned', 'pending')),
    created_at timestamptz not null default now(),
    last_login timestamptz
);

-- GAMES
create table if not exists games (
    id uuid primary key default gen_random_uuid(),
    board jsonb not null,
    current_player text not null check (current_player in ('X', 'O')),
    player_x uuid references users(id) on delete set null,
    player_o uuid references users(id) on delete set null,
    status text not null check (status in ('playing', 'completed', 'draw', 'waiting')),
    bet_amount numeric(18,6) not null default 0,
    pot numeric(18,6) not null default 0,
    winner text check (winner in ('X', 'O')),
    created_at timestamptz not null default now(),
    ended_at timestamptz
);

-- LEADERBOARD
create table if not exists leaderboard (
    user_id uuid primary key references users(id) on delete cascade,
    total_wins integer not null default 0,
    total_earnings numeric(18,6) not null default 0,
    win_rate numeric(5,2) not null default 0
);

-- TRANSACTIONS
create table if not exists transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    type text not null check (type in ('deposit', 'withdrawal', 'bet', 'win', 'refund')),
    amount numeric(18,6) not null,
    currency text not null default 'USDT',
    status text not null check (status in ('pending', 'completed', 'failed')),
    wallet_address text,
    tx_hash text,
    created_at timestamptz not null default now(),
    completed_at timestamptz
);

-- WITHDRAW REQUESTS
create table if not exists withdraw_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    amount numeric(18,6) not null,
    wallet_address text not null,
    status text not null default 'pending' check (status in ('pending', 'processed', 'rejected')),
    created_at timestamptz not null default now()
);

-- NOTIFICATIONS
create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    type text not null check (type in ('deposit_request', 'withdrawal_request', 'system')),
    user_id uuid references users(id) on delete cascade,
    amount numeric(18,6),
    status text not null check (status in ('pending', 'approved', 'rejected')),
    message text not null,
    created_at timestamptz not null default now()
);

-- SYSTEM SETTINGS
create table if not exists system_settings (
    id serial primary key,
    platform_fee numeric(5,2) not null default 20.00,
    min_bet numeric(18,6) not null default 1,
    max_bet numeric(18,6) not null default 1000,
    min_withdrawal numeric(18,6) not null default 10,
    maintenance_mode boolean not null default false,
    deposit_wallet_address text,
    platform_fee_vs_bot numeric(5,2) not null default 20.00,
    platform_fee_vs_player numeric(5,2) not null default 10.00,
    
    -- Новые поля для игровых настроек
    max_wins_per_user integer not null default 3,
    bot_win_probability numeric(5,2) not null default 50.00,
    
    updated_at timestamptz not null default now()
);

-- GAME SETTINGS
create table if not exists game_settings (
    id serial primary key,
    bot_win_probability numeric(5,2) not null default 50.00,
    updated_at timestamptz not null default now()
);

-- Индексы для быстрого поиска
create index if not exists idx_users_username on users(username);
create index if not exists idx_users_email on users(email);
create index if not exists idx_games_status on games(status);
create index if not exists idx_games_player_x on games(player_x);
create index if not exists idx_games_player_o on games(player_o);
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_type on transactions(type);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_withdraw_requests_user_id on withdraw_requests(user_id);

-- Вставка начальных настроек, если их нет
INSERT INTO system_settings (platform_fee, min_bet, max_bet, min_withdrawal, maintenance_mode, platform_fee_vs_bot, platform_fee_vs_player)
SELECT 20.00, 1, 1000, 10, false, 20.00, 10.00
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

INSERT INTO game_settings (bot_win_probability)
SELECT 50.00
WHERE NOT EXISTS (SELECT 1 FROM game_settings); 

-- Создаем функцию для принудительного обновления баланса пользователя
-- Эта функция обходит все триггеры и правила, которые могут сбрасывать баланс
CREATE OR REPLACE FUNCTION force_update_user_balance(user_id_param UUID, new_balance NUMERIC)
RETURNS VOID AS $$
BEGIN
    -- Отключаем все триггеры на таблице users
    SET session_replication_role = 'replica';
    
    -- Обновляем баланс напрямую
    UPDATE public.users
    SET balance = new_balance
    WHERE id = user_id_param;
    
    -- Включаем триггеры обратно
    SET session_replication_role = 'origin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для выполнения произвольного SQL запроса
-- Используется для диагностики и исправления проблем
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    EXECUTE sql;
    RETURN '{"success": true}'::JSON;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 

-- Функция для обновления настроек игры в system_settings
CREATE OR REPLACE FUNCTION upsert_game_settings(
  p_bot_win_probability NUMERIC, 
  p_max_wins_per_user INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE system_settings 
  SET 
    bot_win_probability = p_bot_win_probability,
    max_wins_per_user = p_max_wins_per_user,
    updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql; 