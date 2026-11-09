import UserNavbar, { type NavSession } from "@/components/UserNavbar";

export default function LandingNav({ session, mock }: { session: NavSession | null; mock?: boolean }) {
  return <UserNavbar session={session} mock={mock} />;
}
