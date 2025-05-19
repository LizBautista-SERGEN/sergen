
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { WaitlistTable } from "@/components/subscription/waitlist/WaitlistTable";
import { EditWaitlistDialog } from "@/components/subscription/waitlist/EditWaitlistDialog";
import { InvoicesDialog } from "@/components/subscription/waitlist/InvoicesDialog";
import { useWaitlistPage } from "@/hooks/useWaitlistPage";

const WaitlistPage = () => {
  const {
    waitlistEntries,
    invoicesMap,
    loading,
    selectedEntry,
    setSelectedEntry,
    notes,
    setNotes,
    status,
    setStatus,
    showInvoices,
    setShowInvoices,
    selectedWaitlistId,
    updateWaitlistEntry,
    deleteWaitlistEntry,
    downloadInvoice,
    viewInvoices
  } = useWaitlistPage();

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Lista de Espera</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Facturas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <WaitlistTable 
                  waitlistEntries={waitlistEntries}
                  invoicesMap={invoicesMap}
                  viewInvoices={viewInvoices}
                  setSelectedEntry={setSelectedEntry}
                  setStatus={setStatus}
                  setNotes={setNotes}
                  deleteEntry={deleteWaitlistEntry}
                />
              </Table>
            </CardContent>
          </Card>
          
          {/* Edit Dialog */}
          <EditWaitlistDialog 
            selectedEntry={selectedEntry}
            status={status}
            setStatus={setStatus}
            notes={notes}
            setNotes={setNotes}
            updateWaitlistEntry={updateWaitlistEntry}
            onOpenChange={(open) => !open && setSelectedEntry(null)}
          />
          
          {/* Invoices Dialog */}
          <InvoicesDialog 
            showInvoices={showInvoices}
            setShowInvoices={setShowInvoices}
            selectedWaitlistId={selectedWaitlistId}
            invoicesMap={invoicesMap}
            downloadInvoice={downloadInvoice}
          />
        </>
      )}
    </div>
  );
};

export default WaitlistPage;
