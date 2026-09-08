import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, Check, Trash2, PenLine } from "lucide-react";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: (() => void) | undefined;
  initialSignature?: string | undefined;
  recipientName?: string | undefined;
}

export function SignaturePad({
  onSave,
  onClear,
  initialSignature,
  recipientName = "Recipient",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [savedPreview, setSavedPreview] = useState<string | null>(initialSignature || null);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e && e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch) {
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
    }
    const mouseEvent = e as MouseEvent;
    return {
      x: (mouseEvent.clientX - rect.left) * scaleX,
      y: (mouseEvent.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const pos = getPos(e.nativeEvent, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e.nativeEvent, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0f172a"; // Deep navy
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      setSavedPreview(url);
      onSave(url);
    }
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSavedPreview(null);
    onClear?.();
  }, [onClear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <PenLine className="size-3.5 text-primary" /> Sign on Screen ({recipientName})
        </label>
        {hasSignature && (
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
          >
            <RotateCcw className="size-3" /> Clear
          </button>
        )}
      </div>

      <div className="relative rounded-xl border-2 border-dashed border-border bg-slate-50/70 p-1 dark:bg-slate-900/40">
        <canvas
          ref={canvasRef}
          width={400}
          height={160}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="h-36 w-full touch-none cursor-crosshair rounded-lg bg-white dark:bg-slate-950"
        />
        {!hasSignature && !savedPreview && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-xs text-muted-foreground/60">
            <p>Draw recipient signature here with mouse or finger</p>
            <div className="mt-6 w-3/4 border-b border-muted-foreground/20" />
            <p className="mt-1 text-[10px]">X _____________________________</p>
          </div>
        )}
      </div>
    </div>
  );
}
