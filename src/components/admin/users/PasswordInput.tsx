
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordInput = ({ value, onChange }: PasswordInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="password">Contraseña</Label>
      <Input
        id="password"
        name="password"
        type="password"
        value={value}
        onChange={onChange}
        placeholder="********"
      />
    </div>
  );
};
