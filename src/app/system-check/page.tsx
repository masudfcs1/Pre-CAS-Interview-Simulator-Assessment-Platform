"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Camera,
  Mic,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Volume2,
  Cpu,
  Database,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cameraService, CameraService } from "@/services/camera/camera-service";
import { audioService } from "@/services/microphone/audio-service";
import { visionService } from "@/services/face-landmarker/vision-service";
import { transcriptionService } from "@/services/speech/transcription-service";

export default function SystemCheckPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Diagnostic states
  const [cameraStatus, setCameraStatus] = useState<"pending" | "passed" | "failed">("pending");
  const [cameraInfo, setCameraInfo] = useState<{ width: number; height: number; fps: number }>({ width: 0, height: 0, fps: 0 });
  const [lightingQuality, setLightingQuality] = useState<"good" | "low" | "too-bright" | "unknown">("unknown");

  const [micStatus, setMicStatus] = useState<"pending" | "passed" | "failed">("pending");
  const [audioMeter, setAudioMeter] = useState(0);

  // Mic Echo Recording Test
  const [echoStatus, setEchoStatus] = useState<"idle" | "recording" | "recorded" | "playing">("idle");
  const [echoAudioUrl, setEchoAudioUrl] = useState<string | null>(null);

  // Vision Model State
  const [visionStatus, setVisionStatus] = useState<"pending" | "passed" | "failed">("pending");
  const [faceDetected, setFaceDetected] = useState(false);

  // Browser Capabilities
  const [browserCapabilities, setBrowserCapabilities] = useState({
    mediaDevices: false,
    webAudio: false,
    speechRecognition: false,
    mediaRecorder: false,
    indexedDB: false,
    localStorage: false,
  });

  const animRef = useRef<number | null>(null);

  useEffect(() => {
    // Check browser APIs
    if (typeof window !== "undefined") {
      setBrowserCapabilities({
        mediaDevices: !!navigator.mediaDevices?.getUserMedia,
        webAudio: !!(window.AudioContext || (window as any).webkitAudioContext),
        speechRecognition: transcriptionService.isSupported(),
        mediaRecorder: typeof MediaRecorder !== "undefined",
        indexedDB: typeof indexedDB !== "undefined",
        localStorage: typeof localStorage !== "undefined",
      });
    }

    runHardwareDiagnostics();

    return () => {
      cameraService.stopCamera();
      audioService.stopMicrophone();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (echoAudioUrl) URL.revokeObjectURL(echoAudioUrl);
    };
  }, []);

  const runHardwareDiagnostics = async () => {
    // 1. Camera Diagnostic
    try {
      const cam = await cameraService.requestCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = cam.stream;
        await videoRef.current.play().catch(() => {});
        setCameraStatus("passed");
        setCameraInfo({ width: cam.width, height: cam.height, fps: cam.frameRate });

        // Analyze lighting
        const light = CameraService.analyzeLighting(videoRef.current);
        setLightingQuality(light.quality);
      }
    } catch (err) {
      console.warn("Camera check failed:", err);
      setCameraStatus("failed");
    }

    // 2. Microphone Diagnostic
    try {
      await audioService.requestMicrophone();
      setMicStatus("passed");

      // Monitor audio levels
      const checkAudio = () => {
        const feat = audioService.sampleLiveFeatures();
        setAudioMeter(feat.volumePercent);
        animRef.current = requestAnimationFrame(checkAudio);
      };
      animRef.current = requestAnimationFrame(checkAudio);
    } catch (err) {
      console.warn("Mic check failed:", err);
      setMicStatus("failed");
    }

    // 3. MediaPipe FaceLandmarker Model Check
    try {
      const ready = await visionService.initializeLandmarker();
      if (ready) {
        setVisionStatus("passed");
        if (videoRef.current) {
          const res = visionService.processVideoFrame(videoRef.current, performance.now());
          setFaceDetected(res.faceDetected);
        }
      } else {
        setVisionStatus("failed");
      }
    } catch {
      setVisionStatus("failed");
    }
  };

  const handleRecordEchoTest = async () => {
    try {
      setEchoStatus("recording");
      const blob = await audioService.recordTestSnippet(3500);
      const url = URL.createObjectURL(blob);
      setEchoAudioUrl(url);
      setEchoStatus("recorded");
    } catch (err) {
      console.error("Echo test failed:", err);
      setEchoStatus("idle");
    }
  };

  const handlePlayEcho = () => {
    if (!echoAudioUrl) return;
    setEchoStatus("playing");
    const audio = new Audio(echoAudioUrl);
    audio.onended = () => setEchoStatus("recorded");
    audio.play();
  };

  const overallReady =
    micStatus === "passed" &&
    browserCapabilities.mediaDevices &&
    browserCapabilities.webAudio;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System & Hardware Readiness
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verify your webcam, microphone, lighting, and browser capabilities before your Pre-CAS interview.
          </p>
        </div>

        <Button
          onClick={runHardwareDiagnostics}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Re-run Diagnostics
        </Button>
      </div>

      {/* Readiness Status Banner */}
      <Card
        className={`p-5 border-l-4 ${
          overallReady
            ? "border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
            : "border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                overallReady
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              }`}
            >
              {overallReady ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {overallReady ? "System Ready for Mock Interview" : "System Readiness Warnings Detected"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {overallReady
                  ? "Your microphone, audio engine, and browser environment are verified."
                  : "Microphone or media permissions need attention. Review details below."}
              </p>
            </div>
          </div>

          <Link href="/interview">
            <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs">
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Go to Mock Interview
            </Button>
          </Link>
        </div>
      </Card>

      {/* Hardware Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Camera Test Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-500" />
              <CardTitle className="text-sm">Webcam & Facial Tracking Test</CardTitle>
            </div>
            <Badge variant={cameraStatus === "passed" ? "success" : "warning"}>
              {cameraStatus === "passed" ? "Active" : "Check Needed"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-navy-700">
              <video
                ref={videoRef}
                muted
                playsInline
                autoPlay
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  cameraStatus !== "passed" ? "hidden" : ""
                }`}
              />
              {cameraStatus !== "passed" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-400">
                  <Camera className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs font-semibold">Webcam stream inactive or denied</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Allow camera access in your browser toolbar to enable live gaze tracking.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-navy-800">
                <span className="text-slate-500 dark:text-slate-400">Resolution</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {cameraInfo.width > 0 ? `${cameraInfo.width} x ${cameraInfo.height} px` : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-navy-800">
                <span className="text-slate-500 dark:text-slate-400">Lighting Quality</span>
                <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                  {lightingQuality === "good" ? "✓ Optimal Brightness" : lightingQuality}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Face Landmark Detection</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {visionStatus === "passed" ? "✓ MediaPipe Ready" : "CPU Fallback"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Microphone Test Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-sm">Microphone & Audio Input Test</CardTitle>
            </div>
            <Badge variant={micStatus === "passed" ? "success" : "danger"}>
              {micStatus === "passed" ? "Detected" : "Unavailable"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Live Volume Meter */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Live Microphone Input Level
                </span>
                <span className="font-mono text-slate-500">{audioMeter}%</span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75"
                  style={{ width: `${Math.min(100, audioMeter * 1.5)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Speak normally. The bar should register green when you talk.
              </p>
            </div>

            {/* Echo Playback Test */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    3-Second Voice Echo Test
                  </h4>
                  <p className="text-[11px] text-slate-500">Record a brief clip and play back to check clarity</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleRecordEchoTest}
                  disabled={echoStatus === "recording" || micStatus !== "passed"}
                  className="text-xs"
                >
                  <Mic className="w-3.5 h-3.5 mr-1" />
                  {echoStatus === "recording" ? "Recording (3s)..." : "Record Audio Snippet"}
                </Button>

                {echoStatus === "recorded" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePlayEcho}
                    className="text-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 mr-1" /> Play Recording
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Browser API Compatibility Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Browser Technology Compatibility Matrix</CardTitle>
          <CardDescription>All analysis runs strictly locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 flex items-center justify-between">
              <span>MediaDevices API</span>
              <Badge variant={browserCapabilities.mediaDevices ? "success" : "danger"}>
                {browserCapabilities.mediaDevices ? "Supported" : "Missing"}
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 flex items-center justify-between">
              <span>Web Audio API</span>
              <Badge variant={browserCapabilities.webAudio ? "success" : "danger"}>
                {browserCapabilities.webAudio ? "Supported" : "Missing"}
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 flex items-center justify-between">
              <span>Web Speech API</span>
              <Badge variant={browserCapabilities.speechRecognition ? "success" : "warning"}>
                {browserCapabilities.speechRecognition ? "Supported" : "Fallback"}
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 flex items-center justify-between">
              <span>MediaRecorder API</span>
              <Badge variant={browserCapabilities.mediaRecorder ? "success" : "warning"}>
                {browserCapabilities.mediaRecorder ? "Supported" : "Fallback"}
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 flex items-center justify-between">
              <span>IndexedDB Storage</span>
              <Badge variant={browserCapabilities.indexedDB ? "success" : "danger"}>
                {browserCapabilities.indexedDB ? "Supported" : "Missing"}
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 flex items-center justify-between">
              <span>Local Storage</span>
              <Badge variant={browserCapabilities.localStorage ? "success" : "danger"}>
                {browserCapabilities.localStorage ? "Supported" : "Missing"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
