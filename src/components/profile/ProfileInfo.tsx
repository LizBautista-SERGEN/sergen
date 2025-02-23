
interface ProfileInfoProps {
  profile: any;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const isSuperUser = profile?.role === 'superuser';

  return (
    <div className="grid gap-4">
      <div>
        <label className="font-semibold mb-2 block">RAZÓN SOCIAL:</label>
        <div className={`text-gray-700 ${isSuperUser ? 'bg-white border border-gray-200' : 'bg-gray-50'} p-2 rounded`}>
          {profile?.business_name || "-"}
        </div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">RUC:</label>
        <div className={`text-gray-700 ${isSuperUser ? 'bg-white border border-gray-200' : 'bg-gray-50'} p-2 rounded`}>
          {profile?.ruc || "-"}
        </div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">ACTIVIDAD:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">{profile?.activity || "-"}</div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">SUMINISTRADOR ELÉCTRICO:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">{profile?.electricity_provider || "-"}</div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">POTENCIA CONTRATADA:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">{profile?.contracted_power || "-"}</div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">VENCIMIENTO DE CONTRATO:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">
          {profile?.contract_expiration ? 
            new Date(profile.contract_expiration).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 
            "-"}
        </div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">PERIODO DE AVISO:</label>
        <div className="text-gray-700 bg-gray-50 p-2 rounded">{profile?.notice_period || "-"}</div>
      </div>
    </div>
  );
};
