
import { format } from "date-fns";

interface HistoricalDataTableProps {
  data: any[];
}

export const HistoricalDataTable = ({ data }: HistoricalDataTableProps) => {
  const formatDate = (isoString: string): string => {
    const fecha = new Date(isoString);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(fecha);
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
              Prog. Semanal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reprog. Diaria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Demanda Prog.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ejecutado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Error %
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
                {row.prog_semanal?.toLocaleString() || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {row.reprogramacion_diaria?.toLocaleString() || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {row.demanda_programada?.toLocaleString() || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {row.ejecutado?.toLocaleString() || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {row.error_porcentual ? `${row.error_porcentual.toFixed(2)}%` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
