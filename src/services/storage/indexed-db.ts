import { openDB, IDBPDatabase } from "idb";
import { InterviewSession, QuestionAttemptScorecard } from "@/types";

const DB_NAME = "casready_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in browser environments"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("sessions")) {
          const sessionStore = db.createObjectStore("sessions", { keyPath: "id" });
          sessionStore.createIndex("by-date", "startedAt");
          sessionStore.createIndex("by-score", "overallScore");
        }
        if (!db.objectStoreNames.contains("attempts")) {
          const attemptStore = db.createObjectStore("attempts", { keyPath: "id" });
          attemptStore.createIndex("by-question", "questionId");
          attemptStore.createIndex("by-date", "timestamp");
        }
      },
    });
  }
  return dbPromise;
}

export async function saveInterviewSession(session: InterviewSession): Promise<void> {
  try {
    const db = await getDB();
    await db.put("sessions", session);
  } catch (err) {
    console.error("Failed to save session in IndexedDB:", err);
    // Fallback: save basic session list in localStorage if IndexedDB is restricted
    try {
      const stored = localStorage.getItem("casready_sessions_backup");
      const list: InterviewSession[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex(s => s.id === session.id);
      if (index >= 0) {
        list[index] = session;
      } else {
        list.push(session);
      }
      localStorage.setItem("casready_sessions_backup", JSON.stringify(list));
    } catch (e) {
      console.warn("LocalStorage fallback also failed:", e);
    }
  }
}

export async function getInterviewSessions(): Promise<InterviewSession[]> {
  try {
    const db = await getDB();
    const sessions = await db.getAll("sessions");
    // Sort descending by start date
    return sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  } catch (err) {
    console.warn("IndexedDB read failed, trying localStorage fallback:", err);
    try {
      const stored = localStorage.getItem("casready_sessions_backup");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export async function getInterviewSessionById(id: string): Promise<InterviewSession | null> {
  try {
    const db = await getDB();
    return (await db.get("sessions", id)) || null;
  } catch {
    const all = await getInterviewSessions();
    return all.find(s => s.id === id) || null;
  }
}

export async function deleteInterviewSession(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("sessions", id);
  } catch (err) {
    console.error("Failed to delete session:", err);
  }
  try {
    const stored = localStorage.getItem("casready_sessions_backup");
    if (stored) {
      const list: InterviewSession[] = JSON.parse(stored);
      const filtered = list.filter(s => s.id !== id);
      localStorage.setItem("casready_sessions_backup", JSON.stringify(filtered));
    }
  } catch {}
}

export async function saveQuestionAttempt(attempt: QuestionAttemptScorecard): Promise<void> {
  try {
    const db = await getDB();
    await db.put("attempts", attempt);
  } catch (err) {
    console.error("Failed to save attempt:", err);
  }
}

export async function getAllQuestionAttempts(): Promise<QuestionAttemptScorecard[]> {
  try {
    const db = await getDB();
    return await db.getAll("attempts");
  } catch {
    return [];
  }
}

export async function clearAllIndexedDBData(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear("sessions");
    await db.clear("attempts");
  } catch (err) {
    console.error("Failed to clear IndexedDB stores:", err);
  }
  try {
    localStorage.removeItem("casready_sessions_backup");
  } catch {}
}

export async function exportAllDataAsJSON(): Promise<string> {
  const sessions = await getInterviewSessions();
  const attempts = await getAllQuestionAttempts();
  const profile = localStorage.getItem("casready_student_profile");
  const settings = localStorage.getItem("casready_settings");
  const questions = localStorage.getItem("casready_custom_questions");

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    profile: profile ? JSON.parse(profile) : null,
    settings: settings ? JSON.parse(settings) : null,
    customQuestions: questions ? JSON.parse(questions) : null,
    sessions,
    attempts,
  };

  return JSON.stringify(exportPayload, null, 2);
}
