import { StudentProfile, PlatformSettings, PreCASQuestion } from "@/types";
import { DEFAULT_STUDENT_PROFILE, DEFAULT_PLATFORM_SETTINGS } from "@/constants/default-profile";
import { DEFAULT_PRE_CAS_QUESTIONS } from "@/constants/default-questions";

const PROFILE_KEY = "casready_student_profile";
const SETTINGS_KEY = "casready_settings";
const QUESTIONS_KEY = "casready_questions_store";

export function loadStudentProfile(): StudentProfile {
  if (typeof window === "undefined") return DEFAULT_STUDENT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_STUDENT_PROFILE;
    return { ...DEFAULT_STUDENT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STUDENT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save profile to localStorage:", err);
  }
}

export function loadPlatformSettings(): PlatformSettings {
  if (typeof window === "undefined") return DEFAULT_PLATFORM_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_PLATFORM_SETTINGS;
    return { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

export function savePlatformSettings(settings: PlatformSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings to localStorage:", err);
  }
}

export function loadQuestions(): PreCASQuestion[] {
  if (typeof window === "undefined") return DEFAULT_PRE_CAS_QUESTIONS;
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) return DEFAULT_PRE_CAS_QUESTIONS;
    const stored: PreCASQuestion[] = JSON.parse(raw);
    if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_PRE_CAS_QUESTIONS;
    return stored;
  } catch {
    return DEFAULT_PRE_CAS_QUESTIONS;
  }
}

export function saveQuestions(questions: PreCASQuestion[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error("Failed to save questions:", err);
  }
}

export function resetQuestionsToDefault(): PreCASQuestion[] {
  if (typeof window === "undefined") return DEFAULT_PRE_CAS_QUESTIONS;
  try {
    localStorage.removeItem(QUESTIONS_KEY);
  } catch {}
  return DEFAULT_PRE_CAS_QUESTIONS;
}
