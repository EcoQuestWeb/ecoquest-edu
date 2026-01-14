-- Add gender column to users table
ALTER TABLE public.users
ADD COLUMN gender text NOT NULL DEFAULT 'male';