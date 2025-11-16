import { writeFile, mkdir } from "node:fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("video") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Save uploads to public/uploads so they are served by Next.js as static files
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const safeName = path.basename((file as any).name || "upload.mp4");
    const filePath = path.join(uploadsDir, safeName);

    await writeFile(filePath, bytes);

    return Response.json({
      success: true,
      path: `/uploads/${safeName}`,
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
