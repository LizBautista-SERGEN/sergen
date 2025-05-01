
export interface CoesData {
  fecha: string;
  reprogramado: number | null;
  pronostico: number | null;
  rango_inferior: number | null;
  rango_superior: number | null;
  ejecutado: number | null;
}

export interface ForecastSettings {
  id: string;
  risk_level: string | null;
  time_range?: string | null;
  modulation_time: string | null;
  last_update: string | null;
}
