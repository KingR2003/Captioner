import { readFile } from "node:fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const videoSrc = body?.videoSrc;

    if (!videoSrc) {
      return Response.json({ success: false, error: "Missing videoSrc" }, { status: 400 });
    }

    // Map URL path (/uploads/...) to disk path under public/
    const rel = videoSrc.startsWith("/") ? videoSrc.slice(1) : videoSrc;
    const fullPath = path.join(process.cwd(), "public", rel);

    const bytes = await readFile(fullPath);

    return new Response(bytes, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="captioned-video.mp4"',
      },
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
