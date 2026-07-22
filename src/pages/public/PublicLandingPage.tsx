
import { StatsSection } from "./Sections/Home/StatsSection";
import { CitiesSection } from "./Sections/Home/CitiesSection";
import { FeaturedHostelsSection } from "./Sections/Home/FeaturedHostelsSection";

import { CTASection } from "./Sections/Home/CTASection";
import HeroSection from "./Sections/Home/HeroSection";
import HowItWorks from "./Sections/Home/HowItWorks";
import WhyChooseUs from "./Sections/Home/WhyChooseUs";
import ProductEcosystem from "./Sections/Home/ProductEcosystem";

export function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-neutral overflow-x-hidden">
      <HeroSection />
      <StatsSection />
      <CitiesSection />
      <FeaturedHostelsSection />
      <HowItWorks />
      <ProductEcosystem />
      <WhyChooseUs />
      {/* <CTASection />   */}
    </div>
  );
}
