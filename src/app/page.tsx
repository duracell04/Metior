import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Manifesto />
    </div>
  );
}
