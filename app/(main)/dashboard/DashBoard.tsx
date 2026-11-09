import Container from "@/components/shared/Container";
import RevisionBanner from "@/components/dashboard/RevisionBanner";
import FocusAreaCard from "@/components/dashboard/FocusAreaCard";
import OverallProgressCard from "@/components/dashboard/OverallProgressCard";
import SheetsProgressCard from "@/components/dashboard/SheetsProgressCard";
import RecentSubmissions from "@/components/dashboard/RecentSubmissions";
import DailyTip, { getDailyTip } from "@/components/dashboard/DailyTip";
import QuickActions from "@/components/dashboard/QuickActions";
import { getDueLabel, getRelativeTime } from "@/components/dashboard/time";
import type { DashboardData } from "@/lib/dashboard";

/**
 * Dashboard composition. Server component: all derived labels are computed
 * here once and passed to memoised client list rows as plain props.
 */
export default function DashBoard({ data: d }: { data: DashboardData }) {
  const totalProblems = d.easy + d.medium + d.hard;
  const totalSolved = d.easySolved + d.mediumSolved + d.hardSolved;

  const weakest =
    d.sheetProgress.length > 0
      ? [...d.sheetProgress].sort((a, b) => a.progress - b.progress)[0]
      : null;

  const revisionItems = d.problemsToRevise.map((item) => ({
    id: item.id,
    title: item.problem.title,
    slug: item.problem.slug,
    difficulty: item.problem.difficulty,
    dueLabel: getDueLabel(item.nextAttempt),
  }));

  const submissionItems = d.recentSubmission.map((sub) => ({
    id: sub.id,
    title: sub.problem.title,
    slug: sub.problem.slug,
    difficulty: sub.problem.difficulty,
    timeLabel: getRelativeTime(sub.solvedAt),
  }));

  const difficultyRows = [
    { difficulty: "easy" as const, solved: d.easySolved, total: d.easy },
    { difficulty: "medium" as const, solved: d.mediumSolved, total: d.medium },
    { difficulty: "hard" as const, solved: d.hardSolved, total: d.hard },
  ];

  return (
    <Container className="flex flex-col gap-4 py-10 md:py-12">
      {/* Greeting */}
      <header className="animate-fade-in-up mb-2">
        <span className="eyebrow">
          <span className="h-1 w-1 rounded-full bg-accent" />
          Dashboard
        </span>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-fg sm:text-4xl">
          Good to see you, {d.name}
        </h1>
        <p className="mt-2 text-sm text-fg-secondary">
          {d.totalDue > 0
            ? `You have ${d.totalDue} problem${d.totalDue > 1 ? "s" : ""} due for revision today.`
            : "All caught up — keep the streak going."}
        </p>
      </header>

      {/* Revision queue */}
      <div className="animate-fade-in-up animation-delay-100">
        <RevisionBanner items={revisionItems} totalDue={d.totalDue} />
      </div>

      {/* Focus area + overall progress */}
      <div className="animate-fade-in-up animation-delay-200 grid gap-4 lg:grid-cols-2">
        {weakest && <FocusAreaCard sheet={weakest} />}
        <OverallProgressCard
          totalSolved={totalSolved}
          totalProblems={totalProblems}
          completion={d.completion}
          rows={difficultyRows}
          className={weakest ? undefined : "lg:col-span-2"}
        />
      </div>

      {/* Sheet progress */}
      <div className="animate-fade-in-up animation-delay-300">
        <SheetsProgressCard sheets={d.sheetProgress} />
      </div>

      {/* Recent activity + side column */}
      <div className="animate-fade-in-up animation-delay-400 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <RecentSubmissions items={submissionItems} />
        <div className="flex flex-col gap-4">
          <DailyTip tip={getDailyTip()} />
          <QuickActions />
        </div>
      </div>
    </Container>
  );
}
