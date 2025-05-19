
import { TabsContent } from "@/components/ui/tabs";
import { MetricsUserTable, UserMetrics } from "./MetricsUserTable";

interface UserMetricsTabProps {
  users: UserMetrics[];
}

export const UserMetricsTab = ({ users }: UserMetricsTabProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Actividad de Usuarios</h2>
      <MetricsUserTable users={users} />
    </div>
  );
};
