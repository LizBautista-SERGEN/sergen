
import { TableCell, TableRow } from "@/components/ui/table";
import { User } from "../types";
import { UserActions } from "./UserActions";

interface UserRowProps {
  user: User;
  onToggleAccess: (userId: string, currentAccess: boolean) => Promise<void>;
  onResetPassword: (userId: string, userEmail: string) => Promise<void>;
  onDeleteClick: (user: User) => void;
}

export const UserRow = ({
  user,
  onToggleAccess,
  onResetPassword,
  onDeleteClick
}: UserRowProps) => {
  return (
    <TableRow>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.business_name || "-"}</TableCell>
      <TableCell>
        {user.role === 'superuser' ? 'Superusuario' : 'Usuario'}
      </TableCell>
      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
      <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Nunca"}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded text-xs font-medium ${user.has_access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {user.has_access ? 'Activo' : 'Suspendido'}
        </span>
      </TableCell>
      <TableCell>
        <UserActions 
          user={user} 
          onToggleAccess={onToggleAccess}
          onResetPassword={onResetPassword}
          onDeleteClick={onDeleteClick}
        />
      </TableCell>
    </TableRow>
  );
};
