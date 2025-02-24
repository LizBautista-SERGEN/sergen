
export interface CoesData {
  fecha: string;
  pronostico_diario: number | null;
  demanda_real: number | null;
  rango_inferior: number | null;
  rango_superior: number | null;
  reprogramacion: number | null;
}
