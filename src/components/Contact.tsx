
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import AnimatedSection from "./AnimatedSection";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open default email client with pre-filled email
    window.location.href = "mailto:ventas@sergen.pe";
    toast({
      title: "Redirigiendo al correo",
      description: "Se abrirá tu cliente de correo para contactarnos.",
    });
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
                required
                className="min-h-[150px] bg-white/50 backdrop-blur-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-sergen-500 text-white hover:bg-sergen-600"
            >
              Enviar Mensaje
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
