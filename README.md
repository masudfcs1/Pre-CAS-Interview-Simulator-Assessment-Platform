# CASReady — Enterprise-Grade Pre-CAS Interview Simulator & Assessment Platform

> A production-quality, enterprise-level Pre-CAS Interview Preparation & Assessment Platform for international students preparing for UK university Pre-CAS interviews. 100% in-browser offline intelligence with zero external cloud dependencies.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-14%20Passing-emerald?logo=vitest)](https://vitest.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-purple)](#privacy--security-architecture)

---

## 🌟 Executive Overview

In the UK student visa application process under the points-based immigration system, universities conduct rigorous **Pre-CAS (Confirmation of Acceptance for Studies) interviews** to verify student credibility, English proficiency, course knowledge, financial viability, and genuine intention to study.

**CASReady** simulates these realistic university interviews and assesses students across multiple dimensions:
1. **Answer Quality & Relevance:** Rule-based keyword matching, depth, 3-stage logical structure, and consistency with personal background.
2. **English Speaking Fluency:** Speaking speed (words per minute), filler word density, pause intervals, sentence length variation, and vocabulary richness.
3. **Visual Attention & Eye Tracking:** Real webcam facial landmark analysis using Google MediaPipe Face Landmarker to estimate head pose orientation and screen-facing consistency.
4. **Hardware & Acoustic Readiness:** Web Audio API volume metering, background silence thresholding, and echo recording tests.
5. **Progressive Analytics:** Longitudinal progression charts, radar competency profiles, and category breakdowns.

---

## 🚀 Key Features

### 1. Pre-CAS Question Bank (20 Structured Questions)
- Organized across 7 official Pre-CAS categories:
  - **Personal Background** (Questions 1–3)
  - **Course and University** (Questions 4–7)
  - **UK Study Motivation** (Questions 8–11)
  - **Academic and Professional Plans** (Questions 12–14)
  - **Financial Readiness** (Questions 15–17)
  - **Accommodation and Student Life** (Questions 18–19)
  - **Final Assessment** (Question 20)
- Search by keyword, filter by difficulty (Easy, Medium, Hard), filter by category, favorite questions.
- Detailed modal guide for each question: What the interviewer expects, key points to include, common pitfalls to avoid, suggested 3-stage structure, and recommended answer durations.
- Add and edit custom questions with custom keywords and rubrics.

### 2. High-Fidelity Mock Interview Room
- **Three Interview Modes:**
  - **Mode A (16-Question Practice):** Focused, balanced interview drill.
  - **Mode B (Full 20-Question Simulation):** Comprehensive full-length practice.
  - **Mode C (Custom Interview):** Tailored selection of specific questions or categories.
- **Interviewer Voice Synthesis (TTS):** Uses Web Speech Synthesis with natural British English inflection to read questions aloud.
- **Real-Time Visual Attention Monitoring:**
  - MediaPipe Face Landmarker detects 3D facial landmarks (nose tip, chin, eye corners).
  - Estimates yaw, pitch, and roll to classify gaze into **Screen-Facing (Green)**, **Attention Shift (Yellow)**, or **Looking Away (Red)**.
  - Honest disclosure: non-punitive fallback when camera is unavailable.
- **Live Acoustic & Speech Analysis:**
  - Web Audio API AnalyserNode tracks volume (RMS), silence duration, and speech-to-pause ratios.
  - Web Speech API transcribes spoken answers continuously.
  - Allows manual typing and editing directly in the transcript box as a reliable fallback.
- **Immediate Post-Submission Scorecard:**
  - Evaluates immediately upon submitting each answer.
  - Detailed score breakdown across Answer Quality, Fluency, and Visual Attention.
  - Practical, actionable improvement suggestions.
  - Ability to retry the same question or proceed to the next.

### 3. System & Hardware Readiness Diagnostics (`/system-check`)
- Camera resolution, frame rate, lighting quality analysis, and facial landmark support verification.
- Live microphone input level meter with real-time volume percentage.
- 3.5-second audio echo recording and playback test.
- Comprehensive browser technology compatibility matrix (MediaDevices, Web Audio, Web Speech, MediaRecorder, IndexedDB, LocalStorage).

### 4. Performance Analytics & Longitudinal Tracking (`/analytics`)
- Recharts visualizations:
  - Longitudinal score progression line chart.
  - Multi-dimensional competency radar chart.
  - Speaking speed (WPM) vs. filler word count bar charts.
  - Strongest and weakest category identification.
  - Side-by-side session comparison tool.

### 5. Practice History & Printable Reports (`/history`)
- Historical sessions saved locally in IndexedDB.
- Inspect full question-by-question transcripts, key takeaways, and category scores.
- One-click JSON export for full data portability.
- Printable / PDF-ready practice reports formatted with dedicated print stylesheets.

### 6. Student Profile & Personalization (`/profile`)
- Stores student qualifications, target UK university, course modules, sponsor information, and financial reserve figures.
- Personalizes answer evaluation rules to check consistency between answers and background.

### 7. Verification & QA Dashboard (`/qa`)
- In-browser automated test runner executing live assertions on the client device.
- Unit and integration tests for scoring rubrics, filler word detection, WPM formulas, and persistence.
- Linked to `QA_CHECKLIST.md`.

---

## 🔒 Privacy & Security Architecture

Privacy is paramount for educational and interview preparation platforms:
- **Zero Backend / Zero Telemetry:** There are no backend APIs, databases, or external analytics trackers.
- **No Remote AI APIs:** No third-party LLM APIs (OpenAI, Gemini, Anthropic) receive student voice or text data.
- **Local Media Processing:** Web camera and microphone streams are processed exclusively in browser memory. Video frames are never stored, transmitted, or recorded.
- **Immediate Media Cleanup:** All media tracks call `.stop()` immediately when an interview finishes or the user navigates away.
- **User-Controlled Data:** All session data resides in your browser's IndexedDB and LocalStorage. You can export or delete all data at any time.

---

## 🏗️ Technical Architecture & Directory Structure

```text
src/
├── app/
│   ├── layout.tsx              # Root HTML & AppLayout wrapper
│   ├── page.tsx                # Dashboard with KPI cards & trends
│   ├── questions/              # Pre-CAS Question Bank
│   ├── interview/              # Live Mock Interview Room & Scorecard
│   ├── system-check/           # Camera & Mic Diagnostics Suite
│   ├── analytics/              # Recharts Performance Analytics
│   ├── history/                # Practice History & Reports
│   ├── profile/                # Student Profile Personalization
│   ├── qa/                     # Verification & QA Test Dashboard
│   └── settings/               # Platform Settings & Rubric Weights
│
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx       # Sidebar, Topbar & Navigation
│   └── ui/
│       ├── Button.tsx          # Accessible Button component
│       ├── Card.tsx            # Modern SaaS card surfaces
│       ├── Badge.tsx           # Category & difficulty tags
│       ├── Modal.tsx           # Accessible modal dialogues
│       ├── ProgressBar.tsx     # Animated progress indicator
│       └── ScoreGauge.tsx      # SVG Circular score gauge
│
├── services/
│   ├── camera/
│   │   └── camera-service.ts   # MediaDevices camera manager & lighting analyzer
│   ├── microphone/
│   │   └── audio-service.ts    # Web Audio API volume, pause & echo tester
│   ├── face-landmarker/
│   │   └── vision-service.ts   # MediaPipe FaceLandmarker & head pose gaze heuristics
│   ├── speech/
│   │   └── transcription-service.ts # Web Speech API & TTS engine
│   ├── assessment/
│   │   ├── fluency-analyzer.ts # WPM, filler words, pauses & vocabulary variety
│   │   ├── quality-analyzer.ts # Relevance, structure, keywords & consistency
│   │   └── scoring-engine.ts   # Master weighted score calculator & normalizer
│   └── storage/
│       ├── indexed-db.ts       # IndexedDB session & attempt storage
│       └── local-storage.ts    # Settings, profile & question customizations
│
├── stores/
│   └── useAppStore.ts          # Centralized Zustand global store
├── types/
│   └── index.ts                # Strict TypeScript interfaces
├── constants/
│   ├── default-questions.ts    # 20 Pre-CAS questions with rubrics
│   └── default-profile.ts      # Default student profile & weights
└── test/
    └── assessment.test.ts      # Vitest unit & integration test suites
```

---

## 🛠️ Installation & Getting Started

### Prerequisites
- Node.js >= 20.12.0
- npm >= 10.0.0

### Setup
```bash
# Clone or navigate to the repository
cd pre-cas

# Install dependencies
npm install

# Run the automated test suite
npm test

# Run the development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start practicing.

---

## 📋 Quality Assurance Checklist

For a detailed breakdown of automated unit test specifications, device verification procedures, and accessibility criteria, refer to [`QA_CHECKLIST.md`](./QA_CHECKLIST.md).

---

## ⚖️ License & University Disclosure

CASReady is designed as an independent practice simulator. The questions, suggested structures, and evaluation rubrics provided are illustrative practice guidelines based on standard UK university Pre-CAS criteria and do not constitute an official university assessment or guarantee of visa issuance.
