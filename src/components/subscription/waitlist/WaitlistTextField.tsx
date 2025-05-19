
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WaitlistTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  className?: string;
}

export const WaitlistTextField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = true,
  type = "text",
  className = "bg-blue-50/50"
}: WaitlistTextFieldProps) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={className}
      />
    </div>
  );
};
