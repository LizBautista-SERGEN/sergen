
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  businessName: string;
  setBusinessName: (businessName: string) => void;
  ruc: string;
  setRuc: (ruc: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const RegisterForm = ({
  email,
  setEmail,
  businessName,
  setBusinessName,
  ruc,
  setRuc,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  onSubmit
}: RegisterFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="registerEmail">Correo Electrónico</Label>
        <Input
          id="registerEmail"
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessName">Nombre de la Empresa</Label>
        <Input
          id="businessName"
          type="text"
          placeholder="Nombre de su empresa"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ruc">RUC</Label>
        <Input
          id="ruc"
          type="text"
          placeholder="Número de RUC"
          value={ruc}
          onChange={(e) => setRuc(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registerPassword">Contraseña</Label>
        <Input
          id="registerPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button 
        type="submit"
        className="w-full bg-sergen-500 hover:bg-sergen-600"
        disabled={loading}
      >
        {loading ? "Procesando..." : "Registrarse"}
      </Button>
    </form>
  );
};
