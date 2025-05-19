
import { Card } from "@/components/ui/card";

interface MetricsSummaryCardsProps {
  totalVisits: number;
  activeUsers: number;
  avgTime: number;
}

export const MetricsSummaryCards = ({ totalVisits, activeUsers, avgTime }: MetricsSummaryCardsProps) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Resumen de Métricas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Visitas Totales</div>
          <div className="text-2xl font-bold mt-1">{totalVisits.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Usuarios Activos</div>
          <div className="text-2xl font-bold mt-1">{activeUsers}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
          <div className="text-2xl font-bold mt-1">{avgTime.toFixed(1)} min</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Rebote</div>
          <div className="text-2xl font-bold mt-1">24%</div>
        </Card>
      </div>
    </div>
  );
};
