
import { format } from "date-fns";

interface HistoricalDataTableProps {
  data: any[];
}

export const HistoricalDataTable = ({ data }: HistoricalDataTableProps) => {
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
                {format(new Date(row.fecha), 'dd/MM/yyyy HH:mm')}
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
