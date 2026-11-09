import LandingPage from "./(landing)/LandingPage";
import { getServerSession } from "@/lib/auth-session";
import { getLandingData } from "@/lib/landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, session] = await Promise.all([getLandingData(), getServerSession()]);
  return <LandingPage data={data} session={session} />;
}
