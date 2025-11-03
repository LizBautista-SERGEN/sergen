
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ProfileType } from "@/hooks/useUserProfile";

interface UserDataFormProps {
  profile: ProfileType | null;
  onProfileUpdate: () => void;
}

export const UserDataForm = ({ profile, onProfileUpdate }: UserDataFormProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [contractExpirationDate, setContractExpirationDate] = useState<Date | undefined>(
    profile?.contract_expiration ? new Date(profile.contract_expiration) : undefined
  );

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const form = e.target as HTMLFormElement;
    const formData: Record<string, any> = {
      business_name: form.business_name.value,
      ruc: form.ruc.value,
      activity: form.activity.value,
      electricity_provider: form.electricity_provider.value,
      contracted_power: form.contracted_power.value,
      notice_period: form.notice_period.value,
    };
    
    // Use the selected date from the calendar if available
    if (contractExpirationDate) {
      // Format as YYYY-MM-DD for database storage
      formData.contract_expiration = format(contractExpirationDate, 'yyyy-MM-dd');
      console.log("Saving contract date:", formData.contract_expiration);
    } else {
      formData.contract_expiration = null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para actualizar el perfil",
          variant: "destructive",
        });
        return;
      }

      // Use upsert to insert if not exists or update if exists
      const { error } = await supabase
        .from('user_accounts')
        .upsert({
          id: session.user.id,
          email: session.user.email || '',
          ...formData
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });

      onProfileUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleProfileUpdate} className="space-y-4">
      <div>
        <label className="font-semibold mb-2 block">Razón social:</label>
        <Input 
          name="business_name" 
          defaultValue={profile?.business_name || ""} 
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">RUC:</label>
        <Input 
          name="ruc" 
          defaultValue={profile?.ruc || ""} 
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">Actividad:</label>
        <Input 
          name="activity" 
          defaultValue={profile?.activity || ""} 
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">Suministrador eléctrico:</label>
        <Input 
          name="electricity_provider" 
          defaultValue={profile?.electricity_provider || ""} 
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">Potencia contratada:</label>
        <Input 
          name="contracted_power" 
          defaultValue={profile?.contracted_power || ""} 
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">Vencimiento de contrato:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !contractExpirationDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {contractExpirationDate ? (
                format(contractExpirationDate, "d 'de' MMMM 'de' yyyy", { locale: es })
              ) : (
                "Seleccionar fecha de vencimiento"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={contractExpirationDate}
              onSelect={setContractExpirationDate}
              initialFocus
              locale={es}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="font-semibold mb-2 block">Periodo de aviso:</label>
        <Input 
          name="notice_period" 
          defaultValue={profile?.notice_period || ""} 
        />
      </div>
      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Actualizando..." : "Actualizar datos"}
      </Button>
    </form>
  );
};
