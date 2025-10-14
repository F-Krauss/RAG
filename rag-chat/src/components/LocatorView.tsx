import React, { useState } from 'react';
import type { Theme } from '../lib/types';
import type { Lang } from '../lib/i18n';
import { Camera, QrCode } from 'lucide-react';
import CameraModal from './chat/CameraModal';
import QrScannerModal from './chat/QrScannerModal';
import { t } from '../lib/i18n';
import type { Attachment } from '../lib/types';

export default function LocatorView({ theme, lang }: { theme: Theme; lang: Lang }) {
  const [showCamera, setShowCamera] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  return (
    <div
      className={`p-6 flex flex-col items-center ${
        theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <h1 className="text-xl font-semibold mb-6">{t(lang, 'locator', 'title')}</h1>

      <div className="flex gap-4 mb-6">
        {/* 📷 Take Photo */}
        <button
          onClick={() => setShowCamera(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Camera size={20} />
          {t(lang, 'locator', 'takePhoto') || 'Tomar foto'}
        </button>

        {/* 🔍 Scan QR */}
        <button
          onClick={() => setShowQR(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <QrCode size={20} />
          {t(lang, 'locator', 'scanQR') || 'Escanear QR'}
        </button>
      </div>

      {/* 📸 Preview Photo */}
      {photoURL && (
        <div className="mt-4">
          <p className="text-sm opacity-70 mb-1">Foto capturada:</p>
          <img src={photoURL} alt="captura" className="w-48 h-36 object-cover rounded-lg border" />
        </div>
      )}

      {/* 🧾 Show Scanned Data */}
      {scannedData && (
        <div className="mt-4">
          <p className="text-sm opacity-70 mb-1">Código detectado:</p>
          <p className="text-lg font-medium break-all">{scannedData}</p>
        </div>
      )}

      {/* 🪟 Modals */}
      <CameraModal
        open={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(file: Attachment) => {
          // Preferimos el dataUrl que ya entrega el modal
          setPhotoURL(file.dataUrl);
        }}
      />

      <QrScannerModal
        open={showQR}
        onClose={() => setShowQR(false)}
        onResult={(code: string) => {
          setScannedData(code);
          setShowQR(false);
        }}
      />
    </div>
  );
}
