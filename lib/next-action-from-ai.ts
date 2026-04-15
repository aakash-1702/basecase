const decideNextActionForInterview = (
  currentQuestionIndex: number,
  noOfFollowUps: number,
  totalQuestions: number,
) => {
  if (currentQuestionIndex === -1) {
    return "ice-breaker";
  }

  if (currentQuestionIndex >= totalQuestions - 1) {
    return "interview-completed";
  }

  if (noOfFollowUps < 2) {
    return "follow-up";
  }

  return "main-question";
};

export default decideNextActionForInterview;
