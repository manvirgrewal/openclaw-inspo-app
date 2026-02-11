"use client";

import { useState, useCallback, useRef } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X, Check, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { cropAndCompress, dataUrlByteSize } from "@/lib/utils/image-compress";

interface AvatarCropModalProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export function AvatarCropModal({ open, imageSrc, onClose, onSave }: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedArea) return;
    setSaving(true);
    try {
      // For rotated images, we need to draw on a rotated canvas first
      let src = imageSrc;
      if (rotation !== 0) {
        src = await rotateImage(imageSrc, rotation);
      }
      const compressed = await cropAndCompress(src, croppedArea);
      const sizeKB = (dataUrlByteSize(compressed) / 1024).toFixed(1);
      console.log(`[Avatar] Compressed to ${sizeKB}KB`);
      onSave(compressed);
    } catch (err) {
      console.error("Failed to crop avatar:", err);
    } finally {
      setSaving(false);
    }
  }, [imageSrc, croppedArea, rotation, onSave]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X size={20} />
          </button>
          <h2 className="text-sm font-semibold text-zinc-200">Crop Photo</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            {saving ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-zinc-600 border-t-zinc-900" />
            ) : (
              <Check size={14} />
            )}
            Save
          </button>
        </div>

        {/* Cropper */}
        <div className="relative h-72 w-full bg-black sm:h-80">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 border-t border-zinc-800 px-4 py-3">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <ZoomOut size={16} />
          </button>

          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1 w-32 appearance-none rounded-full bg-zinc-700 accent-zinc-300"
          />

          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <ZoomIn size={16} />
          </button>

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Rotate an image on canvas and return a new data URL */
async function rotateImage(src: string, rotation: number): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });

  const canvas = document.createElement("canvas");
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  canvas.width = img.width * cos + img.height * sin;
  canvas.height = img.width * sin + img.height * cos;

  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return canvas.toDataURL("image/jpeg", 0.95);
}
