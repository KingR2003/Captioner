"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Player } from "@remotion/player";
import { useSearchParams } from "next/navigation";
import { CaptionVideo } from "@/remotion/CaptionVideo";
import { useEffect, useState } from "react";

function PreviewContent() {
  const params = useSearchParams();
  const videoSrc = params.get("video");
  const captionsParam = params.get("captions");
  const preset =
    (params.get("preset") as "bottom" | "top" | "karaoke") || "bottom";

  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!videoSrc) return;

    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.src = videoSrc;

    const onLoaded = () => {
      setDurationSeconds(vid.duration || 0);
      vid.removeEventListener("loadedmetadata", onLoaded);
    };

    vid.addEventListener("loadedmetadata", onLoaded);

    const onError = () => {
      setDurationSeconds(30);
      vid.removeEventListener("error", onError);
    };
    vid.addEventListener("error", onError);

    return () => {
      vid.removeEventListener("loadedmetadata", onLoaded);
      vid.removeEventListener("error", onError);
    };
  }, [videoSrc]);

  if (!videoSrc || !captionsParam) {
    return <div style={{ padding: 40 }}>Missing preview data</div>;
  }

  const parsed = JSON.parse(captionsParam);

  const handleExport = async () => {
    const res = await fetch("/api/render", {
      method: "POST",
      body: JSON.stringify({
        videoSrc,
        captions: parsed,
        stylePreset: preset,
      }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "captioned-video.mp4";
    a.click();
  };

  const fps = 30;
  const durationInFrames = Math.max(1, Math.floor((durationSeconds ?? 10) * fps));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'rgba(30,32,34,0.95)',
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '48px 36px',
        maxWidth: 420,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ marginBottom: 24, fontWeight: 700, fontSize: 24, letterSpacing: 0.5 }}>Caption Preview</h2>

        <Player
          component={CaptionVideo}
          inputProps={{
            videoSrc,
            captions: parsed,
            stylePreset: preset,
          }}
          durationInFrames={durationInFrames}
          fps={fps}
          compositionWidth={1080}
          compositionHeight={1920}
          controls
          style={{
            width: 300,
            height: 550,
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid #444',
            marginBottom: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
          }}
        />

        <button
          onClick={handleExport}
          style={{
            padding: '14px 0',
            background: 'linear-gradient(90deg,#232526 0%,#414345 100%)',
            color: '#ffd700',
            fontWeight: 600,
            fontSize: 17,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            marginTop: 10,
            transition: 'background 0.2s',
          }}
        >
          Export as MP4
        </button>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading preview...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
