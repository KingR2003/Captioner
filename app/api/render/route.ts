import { readFile } from "node:fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const videoSrc = body?.videoSrc;

    if (!videoSrc) {
      return Response.json({ success: false, error: "Missing videoSrc" }, { status: 400 });
    }

    let bytes: Buffer;

    // Check if videoSrc is a full URL (from Vercel Blob) or a local path
    if (videoSrc.startsWith("http://") || videoSrc.startsWith("https://")) {
      // Fetch from URL (Vercel Blob)
      const response = await fetch(videoSrc);
      if (!response.ok) {
        return Response.json(
          { success: false, error: "Failed to fetch video from URL" },
          { status: 400 }
        );
      }
      bytes = Buffer.from(await response.arrayBuffer());
    } else {
      // Read from local filesystem (dev mode)
      const rel = videoSrc.startsWith("/") ? videoSrc.slice(1) : videoSrc;
      const fullPath = path.join(process.cwd(), "public", rel);
      bytes = await readFile(fullPath);
    }

    return new Response(bytes as any, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="captioned-video.mp4"',
      },
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
