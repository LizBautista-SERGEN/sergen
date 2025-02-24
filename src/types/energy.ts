export interface EnergyData {
  id: string;
  date: string;
  time: string;
  forecasted_power: number;
  executed_power: number;
  user_id: string;
  created_at?: string;
  demand?: number;
  consumption?: number;
  is_modulated?: boolean;
}

export interface CoesData {
  id: string;
  date: string;
  executed_power: number | null;
  daily_forecast: number | null;
  weekly_forecast: number | null;
  maximum_power: number | null;
  created_at: string;
}
