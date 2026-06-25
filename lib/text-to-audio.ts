import { SarvamAIClient } from "sarvamai";

const audioGenerator = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAMAI_API_KEY!,
});

const convertTextToAudio = async (text: string) => {
  const response = await audioGenerator.textToSpeech.convert({
    text: text,
    target_language_code: "en-IN",
    speaker: "shubh",
    pace: 1.1,
    speech_sample_rate: 22050,
    enable_preprocessing: true,
    model: "bulbul:v3",
  });



  return response;
};


export default convertTextToAudio;
