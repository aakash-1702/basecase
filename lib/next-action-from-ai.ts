const decideNextActionForInterview = (
  currentQuestionIndex: number,
  noOfFollowUps: number,
  totalQuestions: number,
) => {
  // Ice-breaker phase: always advance to the first main question
  if (currentQuestionIndex === -1) {
    return "next-question";
  }

  // Still within follow-up budget for current question
  if (noOfFollowUps < 2) {
    return "follow-up";
  }

  // Follow-up budget exhausted — check if there are more questions to ask
  // next-question branch will increment the index, so check curIndex + 1
  if (currentQuestionIndex + 1 >= totalQuestions) {
    return "end-interview";
  }

  return "next-question";
};

export default decideNextActionForInterview;
