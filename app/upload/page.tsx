"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [stylePreset, setStylePreset] = useState("bottom");
  const [loading, setLoading] = useState(false);

  // Upload the video to the server
  const uploadVideo = async () => {
    const form = new FormData();
    form.append("video", videoFile!);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!data.success) {
      alert("Upload failed.");
      return null;
    }

    return data.path; // /uploads/<filename>.mp4
  };

  // Generate captions using Whisper (SRT format)
  const generateSTT = async (path: string) => {
    const res = await fetch("/api/stt", {
      method: "POST",
      body: JSON.stringify({ filepath: path }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Caption generation failed.");
      return null;
    }

    return data.captions; // SRT text
  };

  // Convert SRT → caption objects for Remotion
  const parseSrt = (srt: string) => {
    const lines = srt.split("\n");
    const captions: any[] = [];
    let i = 0;

    const toSeconds = (time: string) => {
      const [h, m, s] = time.replace(",", ".").split(":");
      return Number(h) * 3600 + Number(m) * 60 + Number(s);
    };

    while (i < lines.length) {
      if (!lines[i].trim()) {
        i++;
        continue;
      }

      const timeLine = lines[i + 1];
      if (!timeLine) break;

      const [start, end] = timeLine.split(" --> ");

      const text = lines[i + 2] || "";

      captions.push({
        start: toSeconds(start),
        end: toSeconds(end),
        text,
      });

      i += 4;
    }

    return captions;
  };

  // Main flow
  const handleProcess = async () => {
    if (!videoFile) {
      alert("Please upload a video.");
      return;
    }

    setLoading(true);

    // STEP 1 → Upload
    const videoPath = await uploadVideo();
    if (!videoPath) return;

    // STEP 2 → Whisper STT
    const srt = await generateSTT(videoPath);
    if (!srt) return;

    // STEP 3 → Parse SRT
    const captions = srt;

    // STEP 4 → Redirect to Preview
    router.push(
      `/preview?video=${encodeURIComponent(
        videoPath
      )}&captions=${encodeURIComponent(
        JSON.stringify(captions)
      )}&preset=${stylePreset}`
    );

    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'rgba(30,32,34,0.95)',
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '48px 36px',
        maxWidth: 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h1 style={{ marginBottom: 24, fontWeight: 700, fontSize: 28, letterSpacing: 0.5 }}>Upload Video</h1>

        <label htmlFor="video-upload" style={{ fontSize: 16, marginBottom: 8, color: '#f5f5f7' }}>Select MP4 file</label>
        <input
          id="video-upload"
          type="file"
          accept="video/mp4"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          style={{
            marginBottom: 20,
            padding: '8px 0',
            borderRadius: 8,
            border: '1px solid #444',
            background: '#232526',
            color: '#f5f5f7',
            width: '100%',
            fontSize: 15,
          }}
        />

        <label htmlFor="caption-style" style={{ fontSize: 16, marginBottom: 8, color: '#f5f5f7' }}>Caption Style</label>
        <select
          id="caption-style"
          value={stylePreset}
          onChange={(e) => setStylePreset(e.target.value)}
          style={{
            marginBottom: 24,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #444',
            background: '#232526',
            color: '#f5f5f7',
            width: '100%',
            fontSize: 15,
          }}
        >
          <option value="bottom">Bottom Subtitle</option>
          <option value="top">Top Bar</option>
          <option value="karaoke">Karaoke Style</option>
        </select>

        <button
          onClick={handleProcess}
          disabled={loading}
          style={{
            padding: '14px 0',
            background: 'linear-gradient(90deg,#232526 0%,#414345 100%)',
            color: '#ffd700',
            fontWeight: 600,
            fontSize: 17,
            borderRadius: 10,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            marginTop: 10,
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Processing…' : 'Auto-generate + Preview'}
        </button>
      </div>
    </div>
  );
}
