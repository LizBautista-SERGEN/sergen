
export interface EnergyData {
  id: string;
  date: string;
  consumption: number;
  demand: number;
  cost: number;
  created_at: string;
  user_id: string;
  is_modulated: boolean;
}
