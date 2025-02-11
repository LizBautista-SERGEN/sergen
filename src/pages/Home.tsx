
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import SuccessStories from "@/components/SuccessStories";
import Sustainability from "@/components/Sustainability";
import WhyChooseUs from "@/components/WhyChooseUs";

const Home = () => {
  return (
    <main className="overflow-hidden">
      <Hero />
      <About />
      <Services />
      <WhyChooseUs />
      <SuccessStories />
      <Sustainability />
      <Contact />
    </main>
  );
};

export default Home;
