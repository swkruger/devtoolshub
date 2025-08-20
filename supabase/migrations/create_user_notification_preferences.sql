-- Create user_notification_preferences table to store user security notification settings
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    login_alerts BOOLEAN DEFAULT true,
    new_device_logins BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON public.user_notification_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own notification preferences
CREATE POLICY "Users can view their own notification preferences" ON public.user_notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notification preferences
CREATE POLICY "Users can insert their own notification preferences" ON public.user_notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notification preferences
CREATE POLICY "Users can update their own notification preferences" ON public.user_notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON public.user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();
