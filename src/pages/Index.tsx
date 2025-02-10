
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { Feature } from "@/components/ui/feature-with-image-comparison";

const Index = () => {
  return (
    <main className="overflow-hidden">
      <Hero />
      <div className="bg-white shadow-lg rounded-lg mx-auto my-8 max-w-7xl">
        <Feature />
      </div>
      <Services />
      <About />
      <Contact />
    </main>
  );
};

export default Index;
