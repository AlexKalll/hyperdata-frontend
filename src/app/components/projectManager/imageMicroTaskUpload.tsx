"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Selection = { file: File; uploadId: string; error?: string };

function ImagePreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  // eslint-disable-next-line @next/next/no-img-element
  return url ? (
    <img
      src={url}
      alt={file.name}
      loading="lazy"
      decoding="async"
      className="h-20 w-24 object-contain"
    />
  ) : null;
}

export default function ImageMicroTaskUpload({
  taskId,
  requireTest,
  onComplete,
  onUploadingChange,
}: {
  taskId: string;
  requireTest: boolean;
  onComplete: () => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<Selection[]>([]);
  const [instruction, setInstruction] = useState("");
  const [isTest, setIsTest] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{
    uploaded: number;
    failed: number;
  } | null>(null);
  const retrying = selection.some((item) => item.error);

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploading || !selection.length || !session?.access_token) return;
    setUploading(true);
    onUploadingChange(true);
    const failed: Selection[] = [];
    let created = 0;
    try {
      for (let index = 0; index < selection.length; index++) {
        const item = selection[index];
        const { file, uploadId } = item;
        setProgress(
          `Uploading ${index + 1} of ${selection.length}: ${file.name}`,
        );
        const form = new FormData();
        form.append("file", file);
        form.append("upload_id", uploadId);
        form.append("instruction", instruction);
        form.append("is_test", String(isTest));
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/micro-task/${taskId}/image`,
            form,
            {
              headers: { Authorization: `Bearer ${session.access_token}` },
            },
          );
          created++;
        } catch (error) {
          const message = axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : "Upload failed";
          failed.push({
            ...item,
            error: Array.isArray(message)
              ? message.join(", ")
              : String(message),
          });
        }
      }
      setSelection(failed);
      const uploaded = (result?.uploaded || 0) + created;
      setResult({ uploaded, failed: failed.length });
      const summary = `${uploaded} uploaded, ${failed.length} failed`;
      if (created) {
        await queryClient.invalidateQueries({
          queryKey: ["taskMicroTasks", taskId],
        });
      }
      if (failed.length)
        toast.error(`${summary}. Retry the failed uploads below.`);
      else toast.success(summary);
    } finally {
      setUploading(false);
      onUploadingChange(false);
      setProgress("");
    }
    if (!failed.length) onComplete();
  };

  return (
    <form onSubmit={upload} className="space-y-5">
      <label className="block font-medium" htmlFor="microtask-images">
        Images
      </label>
      <input
        id="microtask-images"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={uploading}
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          if (files.length > 100)
            toast.error("Select at most 100 images at a time");
          else if (
            files.some(
              (file) =>
                !["image/jpeg", "image/png", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 10 * 1024 * 1024 ||
                !file.size,
            )
          ) {
            toast.error(
              "Choose non-empty JPEG, PNG, or WebP images, up to 10 MB each",
            );
          } else {
            setSelection(
              files.map((file) => ({ file, uploadId: crypto.randomUUID() })),
            );
            setResult(null);
          }
          event.target.value = "";
        }}
      />
      <p className="text-xs text-gray-500">
        One image creates one microtask. JPEG, PNG, WebP; up to 10 MB and 40
        megapixels per image. Maximum 100 files per selection. Images upload one
        at a time.
      </p>
      {result && (
        <p role="status" className="font-medium">
          {result.uploaded} uploaded, {result.failed} failed
        </p>
      )}
      {selection.map(({ file, uploadId, error }, index) => (
        <div
          key={uploadId}
          className="flex gap-3 items-center rounded border p-2"
        >
          <ImagePreview file={file} />
          <div className="flex-1 min-w-0">
            <p className="break-all text-sm">{file.name}</p>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() =>
              setSelection(selection.filter((_, i) => i !== index))
            }
          >
            Remove
          </Button>
        </div>
      ))}
      <label className="block font-medium" htmlFor="image-instruction">
        Instruction
      </label>
      <textarea
        id="image-instruction"
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        disabled={uploading || retrying}
        rows={3}
        className="w-full rounded border p-3"
        placeholder="Explain what contributors should transcribe or describe..."
      />
      {requireTest && (
        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={isTest}
            onChange={(event) => setIsTest(event.target.checked)}
            disabled={uploading || retrying}
          />
          Mark as test task
        </label>
      )}
      {retrying && (
        <p className="text-xs text-gray-500">
          Retries keep the original instruction and test setting. Choose a new
          selection to change them.
        </p>
      )}
      {progress && <p role="status">{progress}</p>}
      <Button
        type="submit"
        disabled={uploading || !selection.length || !session?.access_token}
      >
        {uploading
          ? "Uploading…"
          : retrying
            ? "Retry failed uploads"
            : "Upload and Create"}
      </Button>
    </form>
  );
}
