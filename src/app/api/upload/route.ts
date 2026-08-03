import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Berkas gambar tidak ditemukan" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Berkas harus berupa gambar" }, { status: 400 });
    }

    // Maksimal 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Fallback ke Base64 Data URL jika Kunci Supabase belum diset di .env
    if (!supabaseKey) {
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `images/${filename}`;

    const bucketName = "proyek";

    // Ensure bucket exists or try uploading
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);

      // Attempt to create bucket if error is bucket not found
      if (uploadError.message?.includes("not found") || uploadError.message?.includes("Bucket")) {
        await supabase.storage.createBucket(bucketName, { public: true });
        const { error: retryError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (retryError) {
          return NextResponse.json(
            { error: `Gagal mengunggah gambar: ${retryError.message}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Gagal mengunggah gambar: ${uploadError.message}` },
          { status: 500 }
        );
      }
    }

    // Dapatkan Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mengunggah gambar" },
      { status: 500 }
    );
  }
}
