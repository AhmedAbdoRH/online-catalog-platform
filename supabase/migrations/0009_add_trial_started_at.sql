-- Add trial_started_at column to catalogs table for subscription management
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS trial_started_at timestamp with time zone DEFAULT NULL;
