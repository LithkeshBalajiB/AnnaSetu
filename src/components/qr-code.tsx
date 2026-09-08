import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode as QrIcon } from "lucide-react";

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  showDownload?: boolean;
  fileName?: string;
}

export function QRCodeView({
  value,
  size = 180,
  className = "",
  showDownload = true,
  fileName = "annasetu-batch-qr",
}: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#064e3b", // Deep emerald
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      },
      (err) => {
        if (!err && canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL("image/png"));
        }
      },
    );
  }, [value, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="rounded-xl border border-emerald-200 bg-white p-2.5 shadow-sm">
        <canvas ref={canvasRef} className="block rounded-lg" />
      </div>
      {showDownload && (
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Download className="size-3.5" /> Download QR
        </button>
      )}
    </div>
  );
}
