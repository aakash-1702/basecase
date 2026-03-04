import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import TickerSection from "@/components/landing/TickerSection";
import ProblemsSection from "@/components/landing/ProblemsSection";
import SheetsSection from "@/components/landing/SheetsSection";
import EditorSection from "@/components/landing/EditorSection";
import GamificationSection from "@/components/landing/GamificationSection";
import ActivitySection from "@/components/landing/ActivitySection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <HeroSection />
      <TickerSection />
      <ProblemsSection />
      <SheetsSection />
      <EditorSection />
      <GamificationSection />
      <ActivitySection />
      <CTASection />
      <LandingFooter />
    </>
  );
}
