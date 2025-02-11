
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Sustainability from "@/components/Sustainability";

const Index = () => {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <div className="flex flex-col w-full min-h-screen">
        <Services />
        <About />
        <Sustainability />
        <Contact />
      </div>
    </div>
  );
};

export default Index;
