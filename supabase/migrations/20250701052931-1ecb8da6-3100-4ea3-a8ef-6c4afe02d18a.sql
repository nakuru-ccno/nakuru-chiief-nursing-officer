
-- Create table for admin settings
CREATE TABLE public.admin_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin users can manage settings" ON public.admin_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'System Administrator')
  )
);

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('data_retention', '{"retentionPeriod": "365", "autoBackup": true, "backupFrequency": "daily", "exportFormat": "xlsx"}'),
('user_permissions', '{"defaultRole": "Staff Nurse", "allowSelfRegistration": false, "requireApproval": true, "allowRoleChange": false}'),
('dashboard_settings', '{"refreshInterval": "15", "autoRefresh": true, "showLiveStats": true, "showSystemLoad": true, "maxActivitiesDisplay": "50"}')
ON CONFLICT (setting_key) DO NOTHING;
