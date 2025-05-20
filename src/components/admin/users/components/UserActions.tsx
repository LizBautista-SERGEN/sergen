
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { User } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserActionsProps {
  user: User;
  onToggleAccess: (userId: string, currentAccess: boolean) => Promise<void>;
  onResetPassword: (userId: string, userEmail: string) => Promise<void>;
  onDeleteClick: (user: User) => void;
}

export const UserActions = ({
  user,
  onToggleAccess,
  onResetPassword,
  onDeleteClick
}: UserActionsProps) => {
  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleAccess(user.id, user.has_access)}
        className={user.has_access ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}
      >
        {user.has_access ? 'Suspender' : 'Activar'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onResetPassword(user.id, user.email)}
      >
        Restablecer
      </Button>
      
      {user.role !== 'superuser' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-50 text-red-600 hover:bg-red-100"
              onClick={() => onDeleteClick(user)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente la cuenta del usuario 
                <span className="font-bold"> {user.email}</span>. 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
