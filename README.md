Remotion Captioning Platform

A simple full-stack tool that lets you upload a video, auto-generate captions, preview them in different styles, and export the final captioned video — all powered by Next.js and Remotion.
What This Project Does

This app focuses on solving one task really well:
👉 Take an MP4 → generate captions → show them on the video → export the final video.

Here’s how it works from the user’s perspective:

Upload an .mp4 file

Click “Auto-Generate Captions”

Choose a caption style:

Bottom subtitles

Top-bar captions

Karaoke (line highlight)

Preview the final video

Export the rendered video as .mp4

Everything runs inside a clean Next.js UI, and Remotion handles the video rendering.
Tech Stack

Next.js 14 — frontend + API routes

Remotion 4 — video rendering

@remotion/player — real-time preview

GROK Whisper API — speech-to-text

TypeScript — because strongly-typed > not

Vercel — hosting + serverless functions
Key Features
✔ Video Upload

Users can upload any .mp4 and immediately preview it.

✔ Auto-Captioning (Hinglish Support)

Captions are generated using OpenAI Whisper.
It handles English + Hindi (Devanagari) mixed sentences naturally.

✔ Caption Styles (3 Presets)

I added three ready-to-use styles:

Bottom subtitles (standard)

Top-bar captions (news headline style)

Karaoke (simple highlight) — the entire line highlights while active

✔ Live Preview

The preview page uses @remotion/player to show exactly how the final video will look.

✔ Export as MP4

The /api/render endpoint uses Remotion’s renderer to export your final captioned video as an .mp4.