import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeatureDeepDiveSection from "@/components/landing/FeatureDeepDiveSection";
import StopRandomSection from "@/components/landing/StopRandomSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <main
      style={{
        background: "#0a0a0a",
        color: "#ffffff",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <LandingNav />
      <HeroSection />
      <FeatureDeepDiveSection />
      <StopRandomSection />
      <LandingFooter />
    </main>
  );
}
