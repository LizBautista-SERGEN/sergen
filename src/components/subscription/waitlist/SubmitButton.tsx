
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  loading: boolean;
}

export const SubmitButton = ({ loading }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-sergen-500 hover:bg-sergen-600"
      disabled={loading}
    >
      {loading ? "Enviando..." : "Enviar solicitud"}
    </Button>
  );
};
