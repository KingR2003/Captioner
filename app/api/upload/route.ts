import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("video") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "_");
    const timestamp = Date.now();
    const blobName = `uploads/${timestamp}-${safeName}`;

    // Upload to Vercel Blob Storage
    const blob = await put(blobName, bytes, {
      access: "public",
      contentType: file.type,
    });

    return Response.json({
      success: true,
      path: blob.url,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return Response.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
