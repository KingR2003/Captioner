import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

export const maxDuration = 300; // allow long video transcription

export async function POST(req: Request) {
  try {
    const { filepath } = await req.json();

    if (!filepath) {
      return Response.json(
        { success: false, error: "Missing video path" },
        { status: 400 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    // Check if filepath is a full URL (from Vercel Blob) or a local path
    const isUrl = filepath.startsWith("http://") || filepath.startsWith("https://");

    let fileInput: any;

    if (isUrl) {
      // For URLs (Vercel Blob), fetch and pass as buffer
      const response = await fetch(filepath);
      if (!response.ok) {
        return Response.json(
          { success: false, error: "Failed to fetch video from URL" },
          { status: 400 }
        );
      }
      const buffer = await response.arrayBuffer();
      fileInput = new File([buffer], "video.mp4", { type: "video/mp4" });
    } else {
      // For local paths, read from filesystem (dev mode)
      const rel = filepath.startsWith("/") ? filepath.slice(1) : filepath;
      let fullPath: string;
      if (rel.startsWith("uploads/")) {
        fullPath = path.join(process.cwd(), "public", rel);
      } else {
        fullPath = path.join(process.cwd(), rel);
      }

      if (!fs.existsSync(fullPath)) {
        return Response.json(
          { success: false, error: `File not found: ${fullPath}` },
          { status: 400 }
        );
      }

      fileInput = fs.createReadStream(fullPath);
    }

    // Whisper transcription via GROQ
    const response: any = await groq.audio.transcriptions.create({
      file: fileInput,
      model: "whisper-large-v3",
      response_format: "verbose_json",
    });

    // Extract segments safely
    const segments =
      response?.segments?.map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
      })) || [];

    return Response.json({
      success: true,
      captions: segments,
    });
  } catch (err: any) {
    console.error("GROQ STT ERROR:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
