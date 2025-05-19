
import { WaitlistTextField } from "./waitlist/WaitlistTextField";
import { InvoiceUploader } from "./waitlist/InvoiceUploader";
import { SubmitButton } from "./waitlist/SubmitButton";
import { useWaitlistForm } from "./waitlist/useWaitlistForm";

interface WaitlistFormProps {
  plan: string;
  onComplete: () => void;
}

export const WaitlistForm = ({ plan, onComplete }: WaitlistFormProps) => {
  const {
    fullName,
    setFullName,
    companyName,
    setCompanyName,
    position,
    setPosition,
    email,
    setEmail,
    phone,
    setPhone,
    invoices,
    setInvoices,
    loading,
    handleSubmit
  } = useWaitlistForm({ plan, onComplete });
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <WaitlistTextField
        id="fullName"
        label="Nombres completos"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Ingrese sus nombres completos"
      />
      
      <WaitlistTextField
        id="companyName"
        label="Empresa"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Nombre de su empresa"
      />
      
      <WaitlistTextField
        id="position"
        label="Cargo"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="Su cargo en la empresa"
      />
      
      <WaitlistTextField
        id="email"
        label="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ejemplo@correo.com"
        type="email"
      />
      
      <WaitlistTextField
        id="phone"
        label="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Número de contacto"
        type="tel"
      />
      
      <InvoiceUploader 
        invoices={invoices} 
        setInvoices={setInvoices} 
      />
      
      <SubmitButton loading={loading} />
    </form>
  );
};
