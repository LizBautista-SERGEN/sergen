
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface UserMetrics {
  id: string;
  email: string;
  lastVisit: string;
  pageViews: number;
  avgTimeMin: number;
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
            <TableHead>Usuario</TableHead>
            <TableHead>Última Visita</TableHead>
            <TableHead>Vistas de Página</TableHead>
            <TableHead>Tiempo Promedio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.lastVisit}</TableCell>
              <TableCell>{user.pageViews}</TableCell>
              <TableCell>{user.avgTimeMin} min</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
