import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

// Nota: En versiones recientes no es necesario (ni soportado) QrScanner.WORKER_PATH.
// Si tu bundler soporta "?worker", puedes importar el worker y pasarlo en "qrEngine".
// Aquí usamos la resolución automática del paquete (simple y portable).

export default function QrScannerModal({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (code: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;
    if (!video) return;

    const scanner = new QrScanner(
      video,
      (result) => {
        onResult(result.data);
        onClose();
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
        returnDetailedScanResult: true,
      }
    );
    scannerRef.current = scanner;

    scanner.start().catch((e) => setError(e?.message || 'No se pudo acceder a la cámara'));

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [open, onClose, onResult]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="font-medium">Escanear QR</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="p-3">
          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <video ref={videoRef} className="w-full rounded" autoPlay muted playsInline />
          )}
        </div>
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
