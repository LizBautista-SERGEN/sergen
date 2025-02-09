
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import SuccessStories from "@/components/SuccessStories";

const Home = () => {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Services />
      <SuccessStories />
      <About />
      <Contact />
    </main>
  );
};

export default Home;
