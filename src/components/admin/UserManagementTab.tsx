
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UsersTable } from "./users/UsersTable";
import { UserManagementHeader } from "./users/components/UserManagementHeader";
import { useUserManagementTab } from "./users/hooks/useUserManagementTab";

export const UserManagementTab = () => {
  const { users, loading, fetchUsers } = useUserManagementTab();

  return (
    <Card>
      <CardHeader>
        <UserManagementHeader refreshUsers={fetchUsers} />
      </CardHeader>
      <CardContent>
        <UsersTable 
          users={users} 
          loading={loading} 
          refreshUsers={fetchUsers}
        />
      </CardContent>
    </Card>
  );
};
