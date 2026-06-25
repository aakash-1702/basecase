const decideNextActionForInterview = (
  currentQuestionIndex: number,
  noOfFollowUps: number,
  totalQuestions: number,
  
) => {
  if(currentQuestionIndex === -1) {
    return "start-interview";
  }

  if(noOfFollowUps < 2) {
    return "follow-up";
  }

  if(currentQuestionIndex === totalQuestions ) {
   return "end-interview";
  }


  return "main-question";


};

export default decideNextActionForInterview;
