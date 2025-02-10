
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { Feature } from "@/components/ui/feature-with-image-comparison";

const Index = () => {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Feature />
      <Services />
      <About />
      <Contact />
    </main>
  );
};

export default Index;
