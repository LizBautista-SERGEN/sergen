
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface UserMetrics {
  id: string;
  email: string;
  lastVisit: string;
  pageViews: number;
  avgTimeMin: number;
  pageTimeData?: {
    pageName: string;
    timeSpentMin: number;
  }[];
}

interface MetricsUserTableProps {
  users: UserMetrics[];
}

export const MetricsUserTable = ({ users }: MetricsUserTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Usuario</TableHead>
            <TableHead className="font-bold">Última Visita</TableHead>
            <TableHead className="font-bold">Vistas de Página</TableHead>
            <TableHead className="font-bold">Tiempo Promedio</TableHead>
            <TableHead className="font-bold">Tiempo por Página</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.lastVisit}</TableCell>
              <TableCell>{user.pageViews}</TableCell>
              <TableCell>{user.avgTimeMin.toFixed(1)} min</TableCell>
              <TableCell>
                {user.pageTimeData ? (
                  <div className="flex flex-col gap-1 text-sm">
                    {user.pageTimeData.map((pageTime, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium pr-2">{pageTime.pageName}:</span>
                        <span>{pageTime.timeSpentMin.toFixed(1)} min</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No hay datos</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
