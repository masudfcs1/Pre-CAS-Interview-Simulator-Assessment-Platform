# CASReady — Quality Assurance & Verification Checklist

**Application Name:** CASReady  
**Role:** Enterprise-Grade Pre-CAS Interview Simulator & Assessment Platform  
**Target Audience:** International students preparing for UK university Pre-CAS interviews  
**Architecture:** 100% In-Browser Frontend Intelligence (No backend / No external AI APIs)

---

## 1. Automated Verification Suite (Vitest)

All tests can be executed via `npm test` or directly inspected in the in-browser QA panel at `/qa`.

| Test ID | Module | Verification Target | Assertion / Expected Behavior | Status |
|---|---|---|---|---|
| `TC-AUT-01` | Fluency Engine | Common Filler Words Detection | Matches `"umm"`, `"uh"`, `"actually"`, `"basically"`, `"you know"`, `"like"`, `"so"`, `"i mean"` with correct frequency | PASS |
| `TC-AUT-02` | Fluency Engine | Speaking Pace (WPM) Formula | `(wordCount / durationSec) * 60` returns expected academic cadence (120-150 WPM) | PASS |
| `TC-AUT-03` | Fluency Engine | Rushed Pace Penalty | Paces > 185 WPM trigger pacing advisory feedback and reduced pacing score | PASS |
| `TC-AUT-04` | Fluency Engine | Empty Transcript Handshake | 0 words returns safe 0 score without runtime exceptions or divide-by-zero | PASS |
| `TC-AUT-05` | Fluency Engine | Web Audio Pauses Integration | Ingests pause counts and speech-to-silence ratio from Web Audio AnalyserNode | PASS |
| `TC-AUT-06` | Quality Engine | Keyword Relevance Matching | Matches question-specific UK university terminology and calculates relevance % | PASS |
| `TC-AUT-07` | Quality Engine | 3-Stage Structure Detection | Verifies presence of introductory statement, core evidentiary body, and concluding summary | PASS |
| `TC-AUT-08` | Quality Engine | Specificity Evaluation | Detects currency (£ / GBP), numerical figures, percentages, and course modules | PASS |
| `TC-AUT-09` | Quality Engine | Missing Points Identification | Flags missing key points from question rubric when not addressed in response | PASS |
| `TC-AUT-10` | Scoring Engine | Camera Unavailable Fallback | Re-normalizes weights across Quality and Fluency without punitive 0 score | PASS |
| `TC-AUT-11` | Scoring Engine | Full Scorecard Assembly | Generates complete `QuestionAttemptScorecard` with key takeaways and sub-scores | PASS |
| `TC-AUT-12` | Question Bank | Question Bank Integrity | Verifies presence of exactly 20 UK university Pre-CAS questions | PASS |
| `TC-AUT-13` | Question Bank | Category Completeness | Confirms all 7 required Pre-CAS categories are represented with rubrics | PASS |
| `TC-AUT-14` | Question Bank | Structure & Duration Standard | Confirms all questions possess 3-stage guidance, common mistakes, and recommended durations | PASS |

---

## 2. Hardware & Browser Media Boundary Verification

| Test ID | Hardware Feature | Test Scenario | Expected Outcome | Verification Method |
|---|---|---|---|---|
| `TC-HW-01` | Camera | User grants camera permission | Live video feed displays with 1280x720 ideal resolution | `/system-check` |
| `TC-HW-02` | Camera | User denies camera permission | Non-punitive banner appears; interview proceeds in audio/transcript mode | Browser permission toggle |
| `TC-HW-03` | Camera | Camera disconnects mid-interview | `videoTrack.onended` triggers fallback state; score calculated from audio/text | Physical disconnect / simulate |
| `TC-HW-04` | Camera | Camera stream cleanup | All media tracks call `.stop()` on unmount/interview finish; camera LED turns off | Navigation away from interview |
| `TC-HW-05` | Microphone | Live audio volume meter | AnalyserNode calculates real-time RMS (0-100%) and animates bar | Voice speech in `/system-check` |
| `TC-HW-06` | Microphone | Echo playback test | Records 3.5s snippet with MediaRecorder and allows immediate audio playback | Echo test button |
| `TC-HW-07` | Microphone | Audio stream cleanup | AudioContext closed and microphone tracks stopped when interview finishes | Memory & track check |

---

## 3. Visual Attention & MediaPipe Landmark Detection

| Test ID | Feature | Test Scenario | Expected Outcome |
|---|---|---|---|
| `TC-ATT-01` | MediaPipe Loader | Initial model fetch | Resolves WASM and task files; CPU fallback if GPU unavailable |
| `TC-ATT-02` | Face Detection | User in frame facing screen | Green badge: "Screen-Facing" (yaw/pitch within +/- 20°) |
| `TC-ATT-03` | Attention Shift | User turns head slightly | Yellow badge: "Attention Shift" (yaw between 22° and 35°) |
| `TC-ATT-04` | Looking Away | User turns away for > 1.3s | Red badge: "Looking Away"; increments looking-away events count |
| `TC-ATT-05` | Privacy Bound | Raw video frames | Video frames are never saved to disk, IndexedDB, or cloud; strictly in-memory |

---

## 4. Mock Interview Workflow Verification

| Test ID | User Flow | Step-by-Step Action | Expected Result |
|---|---|---|---|
| `TC-INT-01` | 16-Question Mode | Launch 16-Question Practice from Dashboard | Queue loads 16 balanced questions; question 1 begins with timer |
| `TC-INT-02` | Full 20-Question Mode | Launch Full 20 Questions | Queue loads all 20 questions in sequential order |
| `TC-INT-03` | Custom Mode | Select specific questions in modal | Queue loads only checked questions |
| `TC-INT-04` | Text-to-Speech | Click audio speaker icon | Synthesizes question title using Web Speech API in British English voice |
| `TC-INT-05` | Live Speech Recognition | Speak into microphone | Words stream into live transcript in real-time |
| `TC-INT-06` | Manual Fallback | Type directly into transcript textarea | User can edit, append, or replace transcript manually before submission |
| `TC-INT-07` | Answer Submission | Click "Submit Answer & Review Scorecard" | Stops recording; generates immediate scorecard modal with 3 score gauges |
| `TC-INT-08` | Retry Question | Click "Practice Same Question Again" | Clears scorecard, resets question timer, restarts speech listener |
| `TC-INT-09` | Next Question | Click "Continue to Next Question" | Advances index to next question; displays new question prompt |
| `TC-INT-10` | Session Completion | Submit answer to final question in queue | Triggers celebration confetti; displays full session scorecard and export options |

---

## 5. Persistence, Export & Analytics Verification

| Test ID | Area | Action | Expected Result |
|---|---|---|---|
| `TC-DAT-01` | IndexedDB | Complete a mock interview | Session record and individual attempt scorecards stored in `casready_db` |
| `TC-DAT-02` | LocalStorage | Update student profile fields | Profile saved under `casready_student_profile` and loaded on page refresh |
| `TC-DAT-03` | JSON Export | Click "Export JSON" on History page | Downloads formatted `.json` file containing full attempts and profile |
| `TC-DAT-04` | PDF Export | Click "Print / Save PDF" | Opens browser print dialog formatted with `@media print` styles |
| `TC-DAT-05` | Clear Data | Click "Clear History" | Prompts confirmation; removes all sessions from IndexedDB cleanly |

---

## 6. Definition of Done (DoD) Criteria

- [x] All 9 main application sections implemented and navigable.
- [x] Production Next.js 14 build compiles with zero errors (`npm run build`).
- [x] All automated unit and integration tests pass cleanly (`npm test`).
- [x] Real-time facial landmark attention tracking implemented with non-punitive fallbacks.
- [x] Real-time Web Audio API volume meter and pause tracker integrated.
- [x] Continuous speech recognition with manual transcript editing fallback.
- [x] Immediate post-submission scorecard with actionable feedback.
- [x] Recharts analytics displaying real session and attempt data.
- [x] 100% client-side privacy: No remote AI API keys or backend server required.
- [x] Responsive layout supporting desktop, tablet, and mobile browsers with dark/light themes.
