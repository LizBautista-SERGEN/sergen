
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserMetricsTab } from "./UserMetricsTab";
import { GeneralMetricsTab } from "./GeneralMetricsTab";
import { LoadingSpinner } from "./LoadingSpinner";
import { useMetricsData } from "./useMetricsData";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePasswordReset } from "../users/hooks/usePasswordReset";

export const MetricsTabs = () => {
  const { 
    isLoading,
    activeTab, 
    setActiveTab, 
    timeFilter, 
    setTimeFilter,
    generalData,
    users,
    totalVisits,
    activeUsers,
    avgTime
  } = useMetricsData();

  const { resetPassword } = usePasswordReset();

  const handleResetAdminPassword = async () => {
    try {
      // Get the user ID for the email
      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('id')
        .eq('email', 'centro_control@sergen.pe')
        .single();
      
      if (userError || !userData) {
        toast.error("Usuario no encontrado: centro_control@sergen.pe");
        return;
      }
      
      const success = await resetPassword(userData.id, 'centro_control@sergen.pe');
      if (success) {
        toast.success("Contraseña actualizada a 'admin01' para centro_control@sergen.pe");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error al resetear contraseña: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          onClick={handleResetAdminPassword}
          variant="outline"
          className="ml-auto"
        >
          Resetear contraseña de administrador
        </Button>
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Periodo:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <GeneralMetricsTab
            generalData={generalData}
            totalVisits={totalVisits}
            activeUsers={activeUsers}
            avgTime={avgTime}
          />
          
          <UserMetricsTab users={users} />
        </>
      )}
    </div>
  );
};
