
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { EmailInput } from "./EmailInput";
import { PasswordInput } from "./PasswordInput";
import { BusinessNameInput } from "./BusinessNameInput";
import { RoleSelector } from "./RoleSelector";
import { useCreateUser } from "./hooks/useCreateUser";

interface CreateUserFormProps {
  onUserCreated: () => void;
}

export const CreateUserForm = ({ onUserCreated }: CreateUserFormProps) => {
  const {
    newUser,
    isSubmitting,
    handleCreateUser,
    handleInputChange,
    handleRoleChange
  } = useCreateUser(onUserCreated);

  return (
    <>
      <div className="grid gap-4 py-4">
        <EmailInput 
          value={newUser.email}
          onChange={handleInputChange}
        />
        
        <PasswordInput 
          value={newUser.password}
          onChange={handleInputChange}
        />
        
        <BusinessNameInput 
          value={newUser.business_name}
          onChange={handleInputChange}
        />
        
        <RoleSelector 
          value={newUser.role}
          onValueChange={handleRoleChange}
        />
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleCreateUser} disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </DialogFooter>
    </>
  );
};
