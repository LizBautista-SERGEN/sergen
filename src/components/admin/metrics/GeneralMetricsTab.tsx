
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
    <TabsContent value="general" className="space-y-6">
      <MetricsPageChart data={generalData} />
      <MetricsSummaryCards 
        totalVisits={totalVisits} 
        activeUsers={activeUsers} 
        avgTime={avgTime} 
      />
    </TabsContent>
  );
};
