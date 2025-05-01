
CREATE OR REPLACE FUNCTION create_risk_settings_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forecast_settings') THEN
    -- Create the table
    CREATE TABLE public.forecast_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      risk_level TEXT DEFAULT 'MEDIO',
      time_range TEXT DEFAULT '18:00 - 23:00',
      last_update TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Insert default record
    INSERT INTO public.forecast_settings (id, risk_level, time_range, last_update)
    VALUES ('00000000-0000-0000-0000-000000000001', 'MEDIO', '18:00 - 23:00', now());
  ELSE
    -- Make sure columns exist
    BEGIN
      -- Add time_range column if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forecast_settings' AND column_name = 'time_range'
      ) THEN
        ALTER TABLE public.forecast_settings ADD COLUMN time_range TEXT DEFAULT '18:00 - 23:00';
      END IF;
      
      -- Update any existing records to have default values if null
      UPDATE public.forecast_settings 
      SET 
        risk_level = COALESCE(risk_level, 'MEDIO'),
        time_range = COALESCE(time_range, '18:00 - 23:00'),
        last_update = COALESCE(last_update, now());
        
      -- Make sure we have at least one record
      IF NOT EXISTS (SELECT FROM public.forecast_settings) THEN
        INSERT INTO public.forecast_settings (id, risk_level, time_range, last_update)
        VALUES ('00000000-0000-0000-0000-000000000001', 'MEDIO', '18:00 - 23:00', now());
      END IF;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Error updating forecast_settings: %', SQLERRM;
    END;
  END IF;
END;
$$;

-- Execute the function to ensure the table exists
SELECT create_risk_settings_table();
