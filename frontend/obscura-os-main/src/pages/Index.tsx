import SpadeLandingNav from "@/components/landing/spade/SpadeLandingNav";
import SpadeHeroSection from "@/components/landing/spade/SpadeHeroSection";
import DevelopersSection from "@/components/landing/spade/DevelopersSection";
import LandingMcpSection from "@/components/landing/spade/LandingMcpSection";
import LandingFinalCta from "@/components/landing/spade/LandingFinalCta";
import MobileAppSection from "@/components/landing/spade/MobileAppSection";
import SpadeFooter from "@/components/landing/spade/SpadeFooter";
import { LogoStrip } from "@/components/landing/vault/LogoStrip";
import { ScrollStory } from "@/components/landing/vault/ScrollStory";
import { EncryptionStory } from "@/components/landing/vault/EncryptionStory";
import { ProductEcosystem } from "@/components/landing/vault/ProductEcosystem";
import { SecurityFoundation } from "@/components/landing/vault/SecurityFoundation";
import { Stats } from "@/components/landing/vault/Stats";

const Index = () => {
  return (
    <div className="landing-spade min-h-screen overflow-x-clip">
      <SpadeLandingNav />
      <SpadeHeroSection />

      <div className="landing-vault">
        <LogoStrip />
        <ScrollStory />
        <EncryptionStory />
        <MobileAppSection />
        <ProductEcosystem />
        <DevelopersSection />
        <LandingMcpSection />
        <SecurityFoundation />
        <Stats />
        <LandingFinalCta />
      </div>

      <SpadeFooter />
    </div>
  );
};

export default Index;
