
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const UsersTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Email</TableHead>
        <TableHead>Empresa</TableHead>
        <TableHead>Rol</TableHead>
        <TableHead>Fecha de Creación</TableHead>
        <TableHead>Último Login</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};
