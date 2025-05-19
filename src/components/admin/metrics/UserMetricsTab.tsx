
import { TabsContent } from "@/components/ui/tabs";
import { MetricsUserTable, UserMetrics } from "./MetricsUserTable";

interface UserMetricsTabProps {
  users: UserMetrics[];
}

export const UserMetricsTab = ({ users }: UserMetricsTabProps) => {
  return (
    <TabsContent value="users">
      <MetricsUserTable users={users} />
    </TabsContent>
  );
};
