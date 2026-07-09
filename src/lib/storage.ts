// Client-side persistence helpers. All values are JSON-serializable.

export type SavedItem = {
  id: string;
  type: "email" | "schedule" | "chat";
  title: string;
  content: string;
  meta?: Record<string, unknown>;
  favorite?: boolean;
  createdAt: number;
};

const KEY_SAVED = "mason.saved";
const KEY_SETTINGS = "mason.settings";
const KEY_CHAT = "mason.chat";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadSaved(): SavedItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY_SAVED);
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}

export function saveItem(item: SavedItem) {
  if (!isBrowser()) return;
  const list = loadSaved();
  list.unshift(item);
  localStorage.setItem(KEY_SAVED, JSON.stringify(list.slice(0, 200)));
}

export function updateSaved(list: SavedItem[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_SAVED, JSON.stringify(list));
}

export type Settings = {
  theme: "light" | "dark" | "system";
  responseLength: "short" | "detailed" | "creative";
  defaultTone: string;
  personality: "professional" | "friendly" | "executive" | "minimal";
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  responseLength: "detailed",
  defaultTone: "Professional",
  personality: "professional",
};

export function loadSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
}

export function loadChat(): unknown[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY_CHAT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChat(messages: unknown[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_CHAT, JSON.stringify(messages));
}

export function clearChat() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_CHAT);
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
