
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicesTab from "@/components/profile/InvoicesTab";
import ContractsTab from "@/components/profile/ContractsTab";
import ReportsTab from "@/components/profile/ReportsTab";

const DocumentsTab = () => {
  const [activeTab, setActiveTab] = useState<string>("facturas");

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="facturas">
          <InvoicesTab />
        </TabsContent>
        <TabsContent value="contratos">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="reportes">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsTab;
