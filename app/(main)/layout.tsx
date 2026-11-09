import ThemedToaster from "@/components/shared/ThemedToaster";
import UserNavbar from "@/components/UserNavbar";
import Footer from "@/components/Footer";
import AmbientBackground from "@/components/shared/AmbientBackground";
import { getServerSession } from "@/lib/auth-session";
import { MOCK_MODE } from "@/lib/mock/mode";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />
      <ThemedToaster />
      <UserNavbar session={session} mock={MOCK_MODE} />
      <main className="relative flex-1">{children}</main>
      <Footer />
    </div>
  );
}
