import { ReportPendingPage } from "@/components/interview/shared/ReportPendingPage";

export const metadata = {
  title: "Generating Report | BaseCase",
  description: "Your interview is being analysed. Your personalised performance report will be ready shortly.",
};

// Next.js 15: params is a Promise in server components
export default async function ReportPendingRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReportPendingPage interviewId={id} />;
}
