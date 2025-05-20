
import { CardTitle } from "@/components/ui/card";
import { UserDialogs } from "./UserDialogs";

interface UserManagementHeaderProps {
  refreshUsers: () => void;
}

export const UserManagementHeader = ({ refreshUsers }: UserManagementHeaderProps) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <CardTitle>Gestión de Usuarios</CardTitle>
      <UserDialogs 
        onUserCreated={refreshUsers} 
        onUserSynced={refreshUsers} 
      />
    </div>
  );
};
