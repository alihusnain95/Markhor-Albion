import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MAX = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function uploadPhoto(file: File, folder = "journal"): Promise<string | null> {
  if (!TYPES.includes(file.type)) { toast.error("Please choose a JPG, PNG, WebP, GIF or AVIF image."); return null; }
  if (file.size > MAX) { toast.error("Photos must be 10 MB or smaller."); return null; }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("journal-media").upload(path, file, { contentType: file.type });
  if (error) { toast.error(`Upload failed: ${error.message}`); return null; }
  return `/api/public/media/${path}`;
}

const VMAX = 50 * 1024 * 1024;
const VTYPES = ["video/mp4", "video/webm", "video/quicktime"];
export async function uploadVideo(file: File): Promise<string | null> {
  if (!VTYPES.includes(file.type)) { toast.error("Please choose an MP4, WebM or MOV video."); return null; }
  if (file.size > VMAX) { toast.error("Videos must be 50 MB or smaller — use a YouTube link for longer films."); return null; }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const path = `gallery/video/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("journal-media").upload(path, file, { contentType: file.type });
  if (error) { toast.error(`Upload failed: ${error.message}`); return null; }
  return `/api/public/media/${path}`;
}

export function PhotoUploadButton({ label, onUploaded, multiple = false, folder = "journal" }: { label: string; onUploaded: (url: string, file: File) => void; multiple?: boolean; folder?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:border-primary disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{busy ? "Uploading…" : label}
      </button>
      <input
        ref={ref}
        type="file"
        accept={TYPES.join(",")}
        multiple={multiple}
        className="hidden"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          for (const f of files) {
            const url = await uploadPhoto(f, folder);
            if (url) onUploaded(url, f);
          }
          setBusy(false);
          toast.success(files.length > 1 ? "Photos uploaded" : "Photo uploaded");
        }}
      />
    </>
  );
}
