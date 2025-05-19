
import { TabsContent } from "@/components/ui/tabs";
import { MetricsPageChart } from "./MetricsPageChart";
import { MetricsSummaryCards } from "./MetricsSummaryCards";
import type { PageMetrics } from "./useMetricsData";

interface GeneralMetricsTabProps {
  generalData: PageMetrics[];
  totalVisits: number;
  activeUsers: number;
  avgTime: number;
}

export const GeneralMetricsTab = ({ 
  generalData,
  totalVisits,
  activeUsers,
  avgTime 
}: GeneralMetricsTabProps) => {
  return (
    <TabsContent value="general" className="space-y-8 w-full">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Visitas por Página</h2>
        <MetricsPageChart data={generalData} />
      </div>
      <MetricsSummaryCards 
        totalVisits={totalVisits} 
        activeUsers={activeUsers} 
        avgTime={avgTime} 
      />
    </TabsContent>
  );
};
