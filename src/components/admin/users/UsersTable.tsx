
import { Table, TableBody } from "@/components/ui/table";
import { UsersTableHeader } from "./components/UsersTableHeader";
import { TableStateDisplay } from "./components/TableStateDisplay";
import { UserRow } from "./components/UserRow";
import { useUserActions } from "./hooks/useUserActions";
import { UsersTableProps } from "./types";

export type { User } from "./types";

export const UsersTable = ({ users, loading, refreshUsers }: UsersTableProps) => {
  const {
    userToDelete,
    setUserToDelete,
    handleToggleAccess,
    handleResetPassword,
    handleDeleteUser
  } = useUserActions(refreshUsers);

  if (loading || !users || users.length === 0) {
    return <TableStateDisplay loading={loading} isEmpty={!loading && (!users || users.length === 0)} />;
  }

  return (
    <>
      <Table>
        <UsersTableHeader />
        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onToggleAccess={handleToggleAccess}
              onResetPassword={handleResetPassword}
              onDeleteClick={setUserToDelete}
            />
          ))}
        </TableBody>
      </Table>
      
      {userToDelete && (
        <div className="hidden">
          {/* This is just to trigger the delete action when AlertDialogAction is clicked */}
          <button onClick={handleDeleteUser} />
        </div>
      )}
    </>
  );
};
