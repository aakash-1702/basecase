import ThemedToaster from "@/components/shared/ThemedToaster";
import AmbientBackground from "@/components/shared/AmbientBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <ThemedToaster />
      {children}
    </div>
  );
}
