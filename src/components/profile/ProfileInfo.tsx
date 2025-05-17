
import { ProfileType } from "@/hooks/useUserProfile";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProfileInfoProps {
  profile: ProfileType | null;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const isSuperUser = profile?.role === 'superuser';

  // Format the contract expiration date if it exists
  const formatExpirationDate = () => {
    if (!profile?.contract_expiration) return "No establecido";
    
    try {
      // Parse the ISO date string from the database
      const date = new Date(profile.contract_expiration);
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (err) {
      console.error("Error formatting contract expiration date:", err);
      return profile.contract_expiration;
    }
  };

  return (
    <div className="grid gap-4">
      <div>
        <label className="font-semibold mb-2 block">RAZÓN SOCIAL:</label>
        <div className={`text-gray-700 ${isSuperUser ? 'bg-white border border-gray-200' : 'bg-gray-50'} p-2 rounded`}>
          {profile?.business_name || "Ultrafrio S.A.C."}
        </div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">RUC:</label>
        <div className={`text-gray-700 ${isSuperUser ? 'bg-white border border-gray-200' : 'bg-gray-50'} p-2 rounded`}>
          {profile?.ruc || "20618382616"}
        </div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">ACTIVIDAD:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">{profile?.activity || "Proceso de productos hidrobiológicos"}</div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">SUMINISTRADOR ELÉCTRICO:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">{profile?.electricity_provider || "Pluz Energía"}</div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">POTENCIA CONTRATADA:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">{profile?.contracted_power || "500 kW"}</div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">VENCIMIENTO DE CONTRATO:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">
          {formatExpirationDate()}
        </div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">PERIODO DE AVISO:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">{profile?.notice_period || "12 meses"}</div>
      </div>
    </div>
  );
};
