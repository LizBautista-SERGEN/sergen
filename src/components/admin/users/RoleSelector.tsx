
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface RoleSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const RoleSelector = ({ value, onValueChange }: RoleSelectorProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="role">Rol</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">Usuario</SelectItem>
          <SelectItem value="superuser">Superusuario</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
