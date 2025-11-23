import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Manifesto />
      <Footer />
    </div>
  );
}
