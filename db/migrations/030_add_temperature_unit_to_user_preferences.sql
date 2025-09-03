-- Add temperature_unit to user_preferences
-- Values: 'C' for Celsius, 'F' for Fahrenheit

alter table if exists public.user_preferences
  add column if not exists temperature_unit text check (temperature_unit in ('C','F')) default 'C';

comment on column public.user_preferences.temperature_unit is 'Preferred temperature unit for weather display (C or F)';

