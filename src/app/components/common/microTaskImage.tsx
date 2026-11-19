"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MicroTaskImage({
  src,
  alt = "Source image",
}: {
  src?: string | null;
  alt?: string;
}) {
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  if (!src) return <p className="text-sm text-gray-500">No image available</p>;
  return (
    <Dialog
      onOpenChange={() => {
        setZoom(100);
        setFailed(false);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="block rounded border p-2 text-left"
          aria-label="Enlarge source image"
        >
          {/* Signed object URLs must be fetched directly, without the image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-48 max-w-full object-contain"
          />
          <span className="block text-xs text-primary mt-1">Enlarge image</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => setZoom(Math.max(100, zoom - 50))}
            disabled={zoom === 100}
          >
            Zoom out
          </Button>
          <span>{zoom}%</span>
          <Button
            variant="outline"
            onClick={() => setZoom(Math.min(400, zoom + 50))}
            disabled={zoom === 400}
          >
            Zoom in
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          {failed ? (
            <div role="alert">
              Image could not be loaded.{" "}
              <Button
                variant="outline"
                onClick={() => {
                  setFailed(false);
                  setRetry(retry + 1);
                }}
              >
                Retry
              </Button>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${retry}`}
              src={src}
              alt={alt}
              onError={() => setFailed(true)}
              style={{ width: `${zoom}%`, maxWidth: "none" }}
              className="object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
