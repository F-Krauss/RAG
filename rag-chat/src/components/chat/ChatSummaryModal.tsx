import { useState } from "react";
import type { Theme } from "../../lib/types";

export default function ChatSummaryModal({
  open,
  onClose,
  onSubmit,
  defaultTitle,
  defaultDescription,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    useful: boolean | null;
    comments: string;
  }) => void;
  defaultTitle?: string;
  defaultDescription?: string;
  theme: Theme;
}) {
  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState(defaultDescription || "");
  const [useful, setUseful] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl shadow-lg p-6 ${
          theme === "dark" ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Resumen del chat</h2>

        <label className="block mb-2 text-sm font-medium">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 rounded-xl border ${
            theme === "dark"
              ? "bg-slate-800 border-slate-700 text-slate-100"
              : "bg-white border-slate-300 text-slate-900"
          }`}
        />

        <label className="block mt-4 mb-2 text-sm font-medium">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 rounded-xl border ${
            theme === "dark"
              ? "bg-slate-800 border-slate-700 text-slate-100"
              : "bg-white border-slate-300 text-slate-900"
          }`}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            ¿El chat fue útil? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setUseful(true)}
              className={`flex-1 py-2 rounded-xl border ${
                useful === true ? "bg-green-600 text-white" : ""
              }`}
            >
              Sí
            </button>
            <button
              onClick={() => setUseful(false)}
              className={`flex-1 py-2 rounded-xl border ${
                useful === false ? "bg-red-600 text-white" : ""
              }`}
            >
              No
            </button>
          </div>
        </div>

        <label className="block mt-4 mb-2 text-sm font-medium">Comentarios</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={2}
          className={`w-full px-3 py-2 rounded-xl border ${
            theme === "dark"
              ? "bg-slate-800 border-slate-700 text-slate-100"
              : "bg-white border-slate-300 text-slate-900"
          }`}
          placeholder="Agrega comentarios adicionales..."
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border font-medium"
          >
            Volver
          </button>
          <button
            onClick={() => {
              if (useful === null) {
                alert("Por favor califica si el chat fue útil o no.");
                return;
              }
              onSubmit({ title, description, useful, comments });
            }}
            className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
