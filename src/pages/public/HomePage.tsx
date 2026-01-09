import { CarouselSection } from "@/components/homepage/CarouselSection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { CallToAction } from "@/components/homepage/CallToAction";
import { StatsSection } from "@/components/homepage/StatsSection";
import { TestimonialsSection } from "@/components/homepage/TestimonialsSection";

export function HomePage() {
  return (
    <>
      
      <div className="relative z-10">
        <CarouselSection />
        
        <div className="container mx-auto space-y-12 py-8">
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <TestimonialsSection />
          <CallToAction />
        </div>
      </div>
    </>
  );
}

export default HomePage; 