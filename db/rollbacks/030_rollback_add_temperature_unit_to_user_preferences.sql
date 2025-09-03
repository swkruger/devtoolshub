-- Rollback temperature_unit from user_preferences

alter table if exists public.user_preferences
  drop column if exists temperature_unit;

