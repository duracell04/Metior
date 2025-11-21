import { Hero } from "@/components/Hero";
import { MathSection } from "@/components/MathSection";
import { WhyItMatters } from "@/components/WhyItMatters";
import { TokenMechanics } from "@/components/TokenMechanics";
import { DemoSection } from "@/components/DemoSection";
import { GinAlpha } from "@/components/GinAlpha";
import { Governance } from "@/components/Governance";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <MathSection />
      <WhyItMatters />
      <TokenMechanics />
      <DemoSection />
      <GinAlpha />
      <Governance />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
