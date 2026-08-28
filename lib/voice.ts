const STORAGE_KEY = "novella-voice-uri";

// Name fragments that tend to indicate a higher-quality, more natural-sounding
// voice (neural/cloud voices, or well-regarded system voices) versus the
// default robotic compact voices most browsers ship.
const PREFERRED_HINTS = [
  "natural",
  "neural",
  "premium",
  "enhanced",
  "online",
  "google us english",
  "google uk english",
  "samantha",
  "daniel",
  "aria",
  "jenny",
  "guy",
  "zira",
  "david",
  "moira",
  "tessa",
  "karen",
  "lee",
  "matilda",
  "eva",
];

// Name fragments that reliably indicate a low-quality, robotic-sounding
// synthesizer (common on Linux/older systems). Always deprioritized, even
// below voices with no positive hints at all.
const ROBOTIC_HINTS = ["espeak", "compact", "pico", "flite", "robot", "mbrola"];

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
}

export function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  if (typeof window !== "undefined") {
    const storedURI = window.localStorage.getItem(STORAGE_KEY);
    if (storedURI) {
      const match = voices.find((v) => v.voiceURI === storedURI);
      if (match) return match;
    }
  }
  const scored = voices.map((v) => {
    const name = v.name.toLowerCase();
    let score = 0;
    PREFERRED_HINTS.forEach((hint, i) => {
      if (name.includes(hint)) score += PREFERRED_HINTS.length - i;
    });
    if (ROBOTIC_HINTS.some((hint) => name.includes(hint))) score -= 100;
    if (!v.localService) score += 2; // cloud voices are usually higher quality
    if (v.lang.toLowerCase() === "en-us") score += 1;
    if (v.default) score += 1;
    return { voice: v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].voice;
}

export function setPreferredVoiceURI(uri: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, uri);
}

/**
 * Splits a paragraph into sentences so narration can pause briefly between
 * them. A single long utterance tends to sound flat and rushed on most
 * synthesizers; short utterances with small gaps read much more naturally.
 */
export function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
  if (!matches) return [text];
  return matches.map((s) => s.trim()).filter(Boolean);
}

/** One-off utterance (word pronunciation, etc.) using the best available voice. */
export function speakText(text: string, rate = 1) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = rate;
  const voice = pickBestVoice(getEnglishVoices());
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}
