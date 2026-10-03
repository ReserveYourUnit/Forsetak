import { useEffect, useState } from 'react';

export type Lang = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface NotificationPrefs {
  newJobs: boolean;
  applicationStatus: boolean;
  messages: boolean;
}

export interface Prefs {
  lang: Lang;
  theme: Theme;
  notifications: NotificationPrefs;
  favProfessions: string[];
  favCountries: string[];
}

const STORAGE_KEY = 'forsetak.prefs.v1';

const DEFAULTS: Prefs = {
  lang: 'ar',
  theme: 'light',
  notifications: { newJobs: true, applicationStatus: true, messages: true },
  favProfessions: [],
  favCountries: []
};

function read(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const saved = JSON.parse(raw) as Partial<Prefs>;
    return {
      ...DEFAULTS,
      ...saved,
      notifications: { ...DEFAULTS.notifications, ...(saved.notifications ?? {}) }
    };
  } catch {
    return DEFAULTS;
  }
}

function apply(p: Prefs) {
  const root = document.documentElement;
  root.classList.toggle('dark', p.theme === 'dark');
  root.lang = p.lang;
  root.dir = p.lang === 'ar' ? 'rtl' : 'ltr';
}

let state: Prefs = read();
const listeners = new Set<() => void>();

// تطبيق الإعدادات المحفوظة أول ما الموقع يفتح
apply(state);

export function getPrefs(): Prefs {
  return state;
}

export function updatePrefs(patch: Partial<Prefs>) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // التخزين غير متاح (وضع التصفح الخاص مثلًا)، والإعداد يفضل شغال لحد ما الصفحة تتقفل
  }
  apply(state);
  listeners.forEach((l) => l());
}

export function usePrefs(): Prefs {
  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return state;
               }
