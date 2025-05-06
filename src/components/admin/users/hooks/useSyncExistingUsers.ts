
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

  return {
    syncData,
    isSubmitting,
    syncExistingUser,
    handleInputChange,
    handleRoleChange
  };
};
