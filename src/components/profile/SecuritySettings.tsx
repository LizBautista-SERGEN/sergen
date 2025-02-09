
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const SecuritySettings = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="font-semibold mb-2 block">ACTUAL CONTRASEÑA:</label>
        <div className="relative">
          <Input type="password" />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">NUEVA CONTRASEÑA:</label>
        <div className="relative">
          <Input type="password" />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div>
        <label className="font-semibold mb-2 block">REPETIR CONTRASEÑA:</label>
        <div className="relative">
          <Input type="password" />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      <Button className="bg-blue-500 hover:bg-blue-600">Cambiar contraseña</Button>
    </div>
  );
};
