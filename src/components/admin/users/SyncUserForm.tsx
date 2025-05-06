
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSelector } from "./RoleSelector";
import { useSyncExistingUsers } from "./hooks/useSyncExistingUsers";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface SyncUserFormProps {
  onUserSynced: () => void;
}

export const SyncUserForm = ({ onUserSynced }: SyncUserFormProps) => {
  const {
    syncData,
    isSubmitting,
    isCleaning,
    syncExistingUser,
    handleInputChange,
    handleRoleChange,
    cleanupUsersExcept
  } = useSyncExistingUsers(onUserSynced);

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            value={syncData.email}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="uuid" className="text-right">
            UUID
          </Label>
          <Input
            id="uuid"
            name="uuid"
            value={syncData.uuid}
            onChange={handleInputChange}
            placeholder="Desde la consola de Supabase"
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="business_name" className="text-right">
            Empresa
          </Label>
          <Input
            id="business_name"
            name="business_name"
            value={syncData.business_name}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Rol
          </Label>
          <div className="col-span-3">
            <RoleSelector 
              value={syncData.role}
              onValueChange={handleRoleChange}
            />
          </div>
        </div>
      </div>
      
      <DialogFooter className="flex justify-between items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={isCleaning}
            >
              <Trash2 size={16} className="mr-2" />
              Limpiar Usuarios
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará TODOS los usuarios excepto victoria_bautista@sergen.pe.
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => cleanupUsersExcept("victoria_bautista@sergen.pe")}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar Usuarios
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <div className="flex gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={syncExistingUser} disabled={isSubmitting || isCleaning}>
            {isSubmitting ? 'Sincronizando...' : 'Sincronizar Usuario'}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
};
