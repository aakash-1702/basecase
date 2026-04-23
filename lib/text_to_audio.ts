import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAMAI_API_KEY!,
});

const textToAudio = async (text: string) => {
  try {
    const response = await client.textToSpeech.convert({
      text,
      target_language_code: "en-IN",
      speaker: "shubh",
      pace: 1.1,
      speech_sample_rate: 16000,
      enable_preprocessing: true,
      model: "bulbul:v3",
    });

    return response;
  } catch (error) {
    console.error("Error converting text to audio:", error);
    return null;
  }
};

export default textToAudio;
