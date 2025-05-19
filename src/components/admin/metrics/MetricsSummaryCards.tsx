
import { Card } from "@/components/ui/card";

interface MetricsSummaryCardsProps {
  totalVisits: number;
  activeUsers: number;
  avgTime: number;
}

export const MetricsSummaryCards = ({ totalVisits, activeUsers, avgTime }: MetricsSummaryCardsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-xl font-bold mb-4">Resumen de Métricas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="text-sm text-muted-foreground">Visitas Totales</div>
          <div className="text-3xl font-bold mt-2">{totalVisits.toLocaleString()}</div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="text-sm text-muted-foreground">Usuarios Activos</div>
          <div className="text-3xl font-bold mt-2">{activeUsers}</div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
          <div className="text-3xl font-bold mt-2">{avgTime.toFixed(1)} min</div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="text-sm text-muted-foreground">Rebote</div>
          <div className="text-3xl font-bold mt-2">24%</div>
        </Card>
      </div>
    </div>
  );
};
