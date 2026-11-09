import ThemedToaster from "@/components/shared/ThemedToaster";
import AmbientBackground from "@/components/shared/AmbientBackground";
import Footer from "@/components/Footer";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import TickerSection from "@/components/landing/TickerSection";
import FeaturesBento from "@/components/landing/FeaturesBento";
import ProblemsSection from "@/components/landing/ProblemsSection";
import SheetsSection from "@/components/landing/SheetsSection";
import InterviewSection from "@/components/landing/InterviewSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import type { NavSession } from "@/components/UserNavbar";
import type { LandingData } from "@/lib/landing";
import { MOCK_MODE } from "@/lib/mock/mode";

export default function LandingPage({
  data,
  session,
}: {
  data: LandingData;
  session: NavSession | null;
}) {
  const isAuthed = Boolean(session?.user);
  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />
      <ThemedToaster />
      <LandingNav session={session} mock={MOCK_MODE} />
      <main className="flex-1">
        <HeroSection stats={data.stats} isAuthed={isAuthed} />
        <TickerSection />
        <FeaturesBento />
        <ProblemsSection problems={data.problems} total={data.stats.problems} />
        <SheetsSection sheets={data.sheets} total={data.stats.sheets} />
        <InterviewSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection isAuthed={isAuthed} />
      </main>
      <Footer />
    </div>
  );
}
