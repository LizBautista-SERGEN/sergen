
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import AnimatedSection from "./AnimatedSection";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Construct email body and subject
      const subject = `Contacto de ${formData.name} desde la web`;
      const body = `
Nombre: ${formData.name}
Email: ${formData.email}
Mensaje: ${formData.message}
      `;
      
      // Open mail client with prefilled data
      window.location.href = `mailto:ventas@sergen.pe?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Show success toast
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos a la brevedad.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error al enviar",
        description: "Ha ocurrido un error. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-sergen-50/30 py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
            Contacto
          </span>
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            ¿Listo para optimizar tu consumo energético?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Contáctanos en ventas@sergen.pe para descubrir cómo podemos ayudarte a reducir costos y
            mejorar tu eficiencia energética.
          </p>
        </AnimatedSection>

        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Nombre
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Mensaje
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="min-h-[150px] bg-white/50 backdrop-blur-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sergen-500 text-white hover:bg-sergen-600"
            >
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
