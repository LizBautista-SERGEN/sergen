
import { format } from "date-fns";

interface HistoricalDataTableProps {
  data: any[];
}

export const HistoricalDataTable = ({ data }: HistoricalDataTableProps) => {
  // Función para formatear la fecha manualmente sin conversiones
  const formatDate = (isoString: string): string => {
    const fecha = new Date(isoString);
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getUTCFullYear();
    const hora = fecha.getUTCHours().toString().padStart(2, '0');
    const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${año} ${hora}:${minutos}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reprogramación Diaria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ejecutado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatDate(row.fecha)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {row.reprogramacion_diaria?.toLocaleString() || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {row.ejecutado?.toLocaleString() || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
