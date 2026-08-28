const URL_STORAGE_KEY = "novella-voicebox-url";
const PROFILE_STORAGE_KEY = "novella-voicebox-profile";
export const DEFAULT_VOICEBOX_URL = "http://127.0.0.1:17493";

export interface VoiceboxProfile {
  id: string;
  name: string;
}

export function getVoiceboxUrl(): string {
  if (typeof window === "undefined") return DEFAULT_VOICEBOX_URL;
  return window.localStorage.getItem(URL_STORAGE_KEY) || DEFAULT_VOICEBOX_URL;
}

export function setVoiceboxUrl(url: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(URL_STORAGE_KEY, url);
}

export function getStoredVoiceboxProfile(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PROFILE_STORAGE_KEY);
}

export function setStoredVoiceboxProfile(id: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(PROFILE_STORAGE_KEY, id);
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timer);
  }
}

/** Pings Voicebox's /health endpoint. Fails fast (short timeout) since this
 * is usually only reachable when the visitor is running it locally. */
export async function checkVoiceboxHealth(baseUrl = getVoiceboxUrl()): Promise<boolean> {
  try {
    const res = await withTimeout(fetch(`${baseUrl}/health`, { cache: "no-store" }), 1200);
    return res.ok;
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function coerceProfileList(data: any): VoiceboxProfile[] {
  const list = Array.isArray(data) ? data : (data?.profiles ?? data?.voices ?? data?.data ?? []);
  if (!Array.isArray(list)) return [];
  return list
    .map((p) => {
      if (typeof p === "string") return { id: p, name: p };
      const id = p?.id ?? p?.profile_id ?? p?.voice_id ?? p?.name;
      const name = p?.name ?? p?.label ?? id;
      return id ? { id: String(id), name: String(name) } : null;
    })
    .filter((p): p is VoiceboxProfile => p !== null);
}

export async function getVoiceboxProfiles(baseUrl = getVoiceboxUrl()): Promise<VoiceboxProfile[]> {
  try {
    const res = await withTimeout(fetch(`${baseUrl}/profiles`, { cache: "no-store" }), 2000);
    if (!res.ok) return [];
    return coerceProfileList(await res.json());
  } catch {
    return [];
  }
}

/**
 * Asks Voicebox to synthesize `text` and returns a playable audio URL
 * (object URL for a raw audio response, or whatever URL/base64 the JSON
 * response provides). Returns null on any failure so the caller can fall
 * back to browser narration for that sentence.
 */
export async function voiceboxGenerate(
  text: string,
  profileId: string | null,
  baseUrl = getVoiceboxUrl()
): Promise<string | null> {
  try {
    const res = await withTimeout(
      fetch(`${baseUrl}/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text,
          profile: profileId,
          profile_id: profileId,
          voice: profileId,
          voice_id: profileId,
        }),
      }),
      15000
    );
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (contentType.startsWith("audio/")) {
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }

    const data = await res.json().catch(() => null);
    if (!data) return null;
    const url: string | undefined = data.url ?? data.audio_url ?? data.audioUrl ?? data.path;
    if (url) return /^https?:\/\//.test(url) ? url : `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    const b64: string | undefined = data.audio ?? data.audio_base64 ?? data.base64 ?? data.data;
    if (b64) return `data:audio/mpeg;base64,${b64}`;
    return null;
  } catch {
    return null;
  }
}
