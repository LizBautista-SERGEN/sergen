
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BusinessNameInput = ({ value, onChange }: BusinessNameInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="business_name">Nombre Empresa</Label>
      <Input
        id="business_name"
        name="business_name"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Nombre de la empresa"
      />
    </div>
  );
};
