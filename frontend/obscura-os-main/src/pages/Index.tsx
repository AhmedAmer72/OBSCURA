import SpadeLandingNav from "@/components/landing/spade/SpadeLandingNav";
import SpadeHeroSection from "@/components/landing/spade/SpadeHeroSection";
import DevelopersSection from "@/components/landing/spade/DevelopersSection";
import IntegrationsScrollSection from "@/components/landing/spade/IntegrationsScrollSection";
import LandingMcpSection from "@/components/landing/spade/LandingMcpSection";
import LandingFinalCta from "@/components/landing/spade/LandingFinalCta";
import MobileAppSection from "@/components/landing/spade/MobileAppSection";
import SpadeFooter from "@/components/landing/spade/SpadeFooter";
import { LogoStrip } from "@/components/landing/vault/LogoStrip";
import { ScrollStory } from "@/components/landing/vault/ScrollStory";
import { FhenixFheSection } from "@/components/landing/vault/FhenixFheSection";
import { ProductEcosystem } from "@/components/landing/vault/ProductEcosystem";
import { SecurityFoundation } from "@/components/landing/vault/SecurityFoundation";
import { PayProductSection } from "@/components/landing/vault/PayProductSection";
import { CreditProductSection } from "@/components/landing/vault/CreditProductSection";
import { VoteProductSection } from "@/components/landing/vault/VoteProductSection";
import { Stats } from "@/components/landing/vault/Stats";

const Index = () => {
  return (
    <div className="landing-spade min-h-screen overflow-x-clip">
      <SpadeLandingNav />
      <SpadeHeroSection />

      <div className="landing-vault">
        <LogoStrip />
        <ScrollStory />
        <FhenixFheSection />
        <MobileAppSection />
        <ProductEcosystem />
        <PayProductSection />
        <CreditProductSection />
        <VoteProductSection />
        <DevelopersSection />
        <LandingMcpSection />
        <SecurityFoundation />
        <Stats />
        <LandingFinalCta />
      </div>

      <IntegrationsScrollSection />

      <SpadeFooter />
    </div>
  );
};

export default Index;
