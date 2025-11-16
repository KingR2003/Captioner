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

    // Map a public URL (/uploads/xxx) to the actual file on disk under public/uploads
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

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    // Whisper transcription via GROQ
    const response: any = await groq.audio.transcriptions.create({
      file: fs.createReadStream(fullPath),
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
