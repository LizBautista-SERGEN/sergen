
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";
import { CreateUserForm } from "../CreateUserForm";
import { SyncUserForm } from "../SyncUserForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserDialogsProps {
  onUserCreated: () => void;
  onUserSynced: () => void;
}

export const UserDialogs = ({ onUserCreated, onUserSynced }: UserDialogsProps) => {
  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw size={18} /> Vincular Usuario
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Usuario Existente</DialogTitle>
          </DialogHeader>
          <SyncUserForm onUserSynced={onUserSynced} />
        </DialogContent>
      </Dialog>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <UserPlus size={18} /> Crear Usuario
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="create">
            <TabsList className="w-full">
              <TabsTrigger value="create" className="flex-1">Crear Nuevo</TabsTrigger>
              <TabsTrigger value="sync" className="flex-1">Vincular Existente</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <CreateUserForm onUserCreated={onUserCreated} />
            </TabsContent>
            <TabsContent value="sync">
              <SyncUserForm onUserSynced={onUserSynced} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
