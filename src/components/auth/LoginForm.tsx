
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit
}: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="loginEmail">Correo Electrónico</Label>
        <Input
          id="loginEmail"
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-blue-50/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="loginPassword">Contraseña</Label>
        <Input
          id="loginPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-blue-50/50"
        />
      </div>
      
      <div className="flex items-center">
        <Checkbox id="remember" className="text-sergen-500" />
        <label
          htmlFor="remember"
          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Recuérdame
        </label>
      </div>
      
      <Button 
        type="submit"
        className="w-full bg-sergen-500 hover:bg-sergen-600 text-white font-medium py-2"
        disabled={loading}
      >
        {loading ? "Procesando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
};
