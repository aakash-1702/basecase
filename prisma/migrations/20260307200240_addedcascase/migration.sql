-- DropForeignKey
ALTER TABLE "InterviewFeedback" DROP CONSTRAINT "InterviewFeedback_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewTurn" DROP CONSTRAINT "InterviewTurn_interviewId_fkey";

-- AddForeignKey
ALTER TABLE "InterviewTurn" ADD CONSTRAINT "InterviewTurn_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
