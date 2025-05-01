
-- Check if the forecast_settings table exists, if not create it
CREATE TABLE IF NOT EXISTS forecast_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_level TEXT DEFAULT 'MEDIO',
  time_range TEXT DEFAULT '18:00 - 23:00',
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default record if none exists
INSERT INTO forecast_settings (id, risk_level, time_range, last_update)
VALUES ('00000000-0000-0000-0000-000000000001', 'MEDIO', '18:00 - 23:00', now())
ON CONFLICT (id) DO NOTHING;

-- Add column for modulation_time if it doesn't exist
ALTER TABLE forecast_settings 
ADD COLUMN IF NOT EXISTS modulation_time TEXT DEFAULT 'SIN MODULACIÓN';

-- Make sure the time_range column exists (it might have been created in a previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'forecast_settings' AND column_name = 'time_range'
  ) THEN
    ALTER TABLE forecast_settings ADD COLUMN time_range TEXT DEFAULT '18:00 - 23:00';
  END IF;
END $$;

-- Update any existing records to have default values if null
UPDATE forecast_settings 
SET 
  risk_level = COALESCE(risk_level, 'MEDIO'),
  time_range = COALESCE(time_range, '18:00 - 23:00'),
  last_update = COALESCE(last_update, now());
