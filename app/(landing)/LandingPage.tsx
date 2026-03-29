import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import TickerSection from "@/components/landing/TickerSection";
import ProblemsSection from "@/components/landing/ProblemsSection";
import TagsBanner from "@/components/landing/TagsBanner";
import SheetsSection from "@/components/landing/SheetsSection";
import EditorSection from "@/components/landing/EditorSection";
import GamificationSection from "@/components/landing/GamificationSection";
import ActivitySection from "@/components/landing/ActivitySection";
import BuiltInPublicSection from "@/components/landing/BuiltInPublicSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import RecentlySolvedFeed from "@/components/landing/RecentlySolvedFeed";
import MobileBottomCTA from "@/components/landing/MobileBottomCTA";

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground pb-20 md:pb-0">
      <LandingNav />
      <HeroSection />
      <TickerSection />
      <ProblemsSection />
      <TagsBanner />
      <SheetsSection />
      <EditorSection />
      <GamificationSection />
      <ActivitySection />
      <BuiltInPublicSection />
      <CTASection />
      <LandingFooter />
      <RecentlySolvedFeed />
      <MobileBottomCTA />
    </div>
  );
}
