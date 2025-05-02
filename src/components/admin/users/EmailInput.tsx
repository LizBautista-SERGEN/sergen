
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmailInput = ({ value, onChange }: EmailInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="email">Correo Electrónico</Label>
      <Input
        id="email"
        name="email"
        type="email"
        value={value}
        onChange={onChange}
        placeholder="correo@ejemplo.com"
      />
    </div>
  );
};
