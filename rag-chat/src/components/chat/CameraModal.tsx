import { useEffect, useRef, useState } from 'react';
import type { Attachment } from '../../lib/types';
import { uuid } from '../../lib/storage';

export default function CameraModal({
  open,
  onClose,
  onCapture,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (file: Attachment) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | undefined;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
      } catch (e: any) {
        setError(e?.message || 'Camera not available');
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">

        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="font-medium">Cámara</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>

        <div className="p-3">
          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <video ref={videoRef} className="w-full rounded" autoPlay muted playsInline />
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700">Cerrar</button>
          <button
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;

              const canvas = document.createElement('canvas');
              canvas.width = v.videoWidth || 1280;
              canvas.height = v.videoHeight || 720;

              const ctx = canvas.getContext('2d');
              if (!ctx) return;

              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/png');

              const attachment: Attachment = {
                id: uuid(),
                name: `photo-${Date.now()}.png`,
                mime: 'image/png',
                size: Math.round(dataUrl.length * 0.75),
                dataUrl,
                createdAt: Date.now(),
              };

              onCapture(attachment);
              onClose();
            }}
            className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Capturar
          </button>
        </div>
      </div>
    </div>
  );
}
