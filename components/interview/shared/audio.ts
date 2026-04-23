type UnknownAudio =
  | string
  | {
      audio?: string;
      audios?: string[];
      data?: { audio?: string; audios?: string[] };
    }
  | null
  | undefined;

export function extractBase64Audio(value: UnknownAudio): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value.audio === "string" && value.audio.length > 0) {
    return value.audio;
  }

  if (Array.isArray(value.audios) && value.audios[0]) {
    return value.audios[0];
  }

  if (value.data) {
    if (typeof value.data.audio === "string" && value.data.audio.length > 0) {
      return value.data.audio;
    }
    if (Array.isArray(value.data.audios) && value.data.audios[0]) {
      return value.data.audios[0];
    }
  }

  return "";
}
