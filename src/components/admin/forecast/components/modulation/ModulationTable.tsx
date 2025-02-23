
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { isFuture } from "date-fns";

interface ModulationTableProps {
  modulatedDates: { [key: string]: boolean };
  onModulationChange: (date: string, isModulated: boolean) => void;
}

export const ModulationTable = ({
  modulatedDates,
  onModulationChange,
}: ModulationTableProps) => {
  const formatDateUTC = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla de Modulación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-center">Estado de Modulación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(modulatedDates)
                .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                .map(([date, isModulated]) => (
                  <TableRow key={date}>
                    <TableCell>{formatDateUTC(date)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={isModulated}
                          onCheckedChange={(checked) => onModulationChange(date, checked)}
                          disabled={isFuture(new Date(date))}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
