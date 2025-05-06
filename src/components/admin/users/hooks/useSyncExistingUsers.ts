
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SyncUserData {
  email: string;
  uuid: string;
  role: string;
  business_name: string;
}

export const useSyncExistingUsers = (onUserSynced: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [syncData, setSyncData] = useState<SyncUserData>({
    email: "",
    uuid: "",
    role: "user",
    business_name: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSyncData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setSyncData(prev => ({ ...prev, role: value }));
  };

  const syncExistingUser = async () => {
    if (!syncData.uuid || !syncData.email) {
      toast.error("El UUID y correo electrónico son obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar si ya existe en user_accounts
      const { data: existingUser, error: checkError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('id', syncData.uuid)
        .single();

      if (existingUser) {
        toast.error("Este UUID ya existe en user_accounts");
        setIsSubmitting(false);
        return;
      }

      // Crear entrada en user_accounts
      const { error: insertError } = await supabase
        .from('user_accounts')
        .insert({
          id: syncData.uuid,
          email: syncData.email.toLowerCase(),
          role: syncData.role,
          business_name: syncData.business_name,
          has_access: true,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error al sincronizar usuario:", insertError);
        toast.error(`Error al sincronizar: ${insertError.message}`);
        setIsSubmitting(false);
        return;
      }

      toast.success("Usuario sincronizado correctamente");
      setSyncData({
        email: "",
        uuid: "",
        role: "user",
        business_name: ""
      });
      onUserSynced();
    } catch (error: any) {
      console.error("Error inesperado:", error);
      toast.error(`Error inesperado: ${error.message || "Desconocido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nueva función para limpiar usuarios excepto el correo especificado
  const cleanupUsersExcept = async (exemptEmail: string) => {
    if (!exemptEmail) {
      toast.error("Debe especificar un correo electrónico a preservar");
      return;
    }

    // Solicitar confirmación
    if (!confirm(`¿Está seguro de eliminar todos los usuarios excepto ${exemptEmail}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsCleaning(true);
    toast.info("Iniciando limpieza de usuarios...");

    try {
      // Primero obtener todos los usuarios de auth.users excepto el correo a preservar
      // Esto debe hacerse desde una función de administrador, ya que no se puede acceder directamente a auth.users
      const { data: result, error } = await supabase.functions.invoke('cleanup-users', {
        body: { exemptEmail }
      });

      if (error) {
        console.error("Error en la limpieza:", error);
        toast.error(`Error al limpiar usuarios: ${error.message}`);
        return;
      }

      if (result && result.success) {
        toast.success(`Limpieza completada: ${result.deletedCount} usuarios eliminados`);
        onUserSynced(); // Refrescar la lista de usuarios
      } else {
        toast.error(`Error: ${result?.message || "Error desconocido"}`);
      }
    } catch (error: any) {
      console.error("Error inesperado:", error);
      toast.error(`Error inesperado: ${error.message || "Desconocido"}`);
    } finally {
      setIsCleaning(false);
    }
  };

  return {
    syncData,
    isSubmitting,
    isCleaning,
    syncExistingUser,
    handleInputChange,
    handleRoleChange,
    cleanupUsersExcept
  };
};
