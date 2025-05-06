
import { useEffect } from "react";
import { useFetchUsers } from "./hooks/useFetchUsers";
import { usePasswordReset } from "./hooks/usePasswordReset";
import { useUserManipulation } from "./hooks/useUserManipulation";

export const useUserManagement = () => {
  const { users, loading, fetchUsers } = useFetchUsers();
  const { resetPassword } = usePasswordReset();
  const { addUserManually, deleteUser } = useUserManipulation();

  useEffect(() => {
    console.log("Iniciando carga de usuarios...");
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    addUserManually,
    deleteUser,
    resetPassword
  };
};
