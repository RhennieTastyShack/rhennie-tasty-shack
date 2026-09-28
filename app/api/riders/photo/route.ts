import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "rider-documents";
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Choose a photo of yourself." },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { success: false, message: "Upload a JPG, PNG, or WEBP photo." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: "Photo must be 4MB or smaller." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = (buckets || []).some((bucket) => bucket.name === BUCKET);

    if (!exists) {
      const { error: bucketError } = await supabase.storage.createBucket(
        BUCKET,
        { public: false }
      );

      if (bucketError && !/already exists/i.test(bucketError.message)) {
        return NextResponse.json(
          { success: false, message: bucketError.message },
          { status: 500 }
        );
      }
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const path = `${user.id}/${Date.now()}-photo.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, message: uploadError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path,
    });
  } catch (error) {
    console.error("Rider photo upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to upload photo.",
      },
      { status: 500 }
    );
  }
}
