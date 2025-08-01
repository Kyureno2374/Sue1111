-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.game_settings (
  id integer NOT NULL DEFAULT nextval('game_settings_id_seq'::regclass),
  bot_win_probability numeric NOT NULL DEFAULT 50.00,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT game_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_user_id uuid,
  players jsonb NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['waiting'::text, 'playing'::text, 'completed'::text, 'draw'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  winner_user_id uuid,
  game_params jsonb,
  board jsonb DEFAULT '[]'::jsonb,
  current_player text DEFAULT 'X'::text,
  player_x uuid,
  player_o uuid,
  bet_amount numeric DEFAULT 0,
  pot numeric DEFAULT 0,
  winner text,
  game_type character varying DEFAULT 'ai'::character varying CHECK (game_type::text = ANY (ARRAY['ai'::character varying, 'multiplayer'::character varying]::text[])),
  player_o_id uuid,
  last_activity timestamp without time zone DEFAULT now(),
  ended_at timestamp without time zone,
  CONSTRAINT games_pkey PRIMARY KEY (id),
  CONSTRAINT games_player_o_id_fkey FOREIGN KEY (player_o_id) REFERENCES public.users(id),
  CONSTRAINT games_player_x_fkey FOREIGN KEY (player_x) REFERENCES public.users(id),
  CONSTRAINT games_winner_user_id_fkey FOREIGN KEY (winner_user_id) REFERENCES public.users(id),
  CONSTRAINT games_creator_user_id_fkey FOREIGN KEY (creator_user_id) REFERENCES public.users(id),
  CONSTRAINT games_player_o_fkey FOREIGN KEY (player_o) REFERENCES public.users(id)
);
CREATE TABLE public.leaderboard (
  user_id uuid NOT NULL,
  total_wins integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  win_rate numeric NOT NULL DEFAULT 0,
  CONSTRAINT leaderboard_pkey PRIMARY KEY (user_id),
  CONSTRAINT leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  amount numeric,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending'::text,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.system_settings (
  id integer NOT NULL DEFAULT nextval('system_settings_id_seq'::regclass),
  min_bet numeric NOT NULL DEFAULT 1,
  max_bet numeric NOT NULL DEFAULT 1000,
  min_withdrawal numeric NOT NULL DEFAULT 10,
  maintenance_mode boolean NOT NULL DEFAULT false,
  deposit_wallet_address text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  bot_win_probability numeric DEFAULT 50.00,
  max_wins_per_user integer DEFAULT 3,
  deposit_fee numeric DEFAULT 20.00,
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['deposit'::text, 'withdrawal'::text, 'bet'::text, 'win'::text, 'refund'::text])),
  amount numeric NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  currency text DEFAULT 'USDT'::text,
  wallet_address text,
  tx_hash text,
  completed_at timestamp with time zone,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text,
  wallet_address text,
  balance numeric NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  games_won integer NOT NULL DEFAULT 0,
  deposits numeric NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  avatar text,
  is_admin boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active'::text,
  last_login timestamp with time zone,
  email text NOT NULL DEFAULT ''::text UNIQUE,
  total_winnings numeric DEFAULT 0,
  multiplayer_games_played integer DEFAULT 0,
  multiplayer_games_won integer DEFAULT 0,
  multiplayer_total_winnings numeric DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.withdraw_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  amount numeric NOT NULL,
  wallet_address text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'processed'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT withdraw_requests_pkey PRIMARY KEY (id),
  CONSTRAINT withdraw_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);