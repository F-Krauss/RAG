import { useState, useMemo } from "react";
import type { Lang } from '../lib/i18n';
import type { Theme } from '../lib/types';

export default function DocsView({
  theme,
  // lang,
}: {
  theme: Theme;
  lang: Lang;
}) {

  const [search, setSearch] = useState("");

  const plants = [
    {
      name: "Planta 1",
      lines: [
        { name: "Línea de producción 1", files: ["Máquina 1", "Máquina 2", "Máquina 3"] },
        { name: "Línea de producción 2", files: ["Máquina 1", "Máquina 2", "Máquina 3"] },
      ],
    },
    {
      name: "Planta 2",
      lines: [
        { name: "Línea de producción 1", files: ["Máquina 1", "Máquina 2", "Máquina 3"] },
        { name: "Línea de producción 2", files: ["Máquina 1", "Máquina 2", "Máquina 3"] },
      ],
    },
    {
      name: "Planta 3",
      lines: [
        { name: "Línea de producción 1", files: ["Máquina 1", "Máquina 2", "Máquina 3"] },
        { name: "Línea de producción 2", files: ["Máquina 1", "Máquina 2", "Máquina 3"] },
      ],
    },
  ];

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900";
  const card = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300";
  const hover = isDark ? "hover:bg-slate-700" : "hover:bg-slate-100";
  const input = isDark
    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
    : "bg-white border-slate-300 text-slate-900 placeholder-slate-500";

  const filteredPlants = useMemo(() => {
    if (!search.trim()) return plants;
    const query = search.toLowerCase();

    return plants
      .map((plant) => ({
        ...plant,
        lines: plant.lines
          .map((line) => ({
            ...line,
            files: line.files.filter(
              (file) =>
                plant.name.toLowerCase().includes(query) ||
                line.name.toLowerCase().includes(query) ||
                file.toLowerCase().includes(query)
            ),
          }))
          .filter((line) => line.files.length > 0),
      }))
      .filter((plant) => plant.lines.length > 0);
  }, [search]);

  return (
    <div className={`p-4 sm:p-6 ${bg}`}>
      <h1 className="text-xl font-semibold mb-4 flex items-center gap-2">
        Librería técnica
      </h1>

      <div className="mb-5 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por planta, línea o máquina..."
          className={`w-full sm:w-96 px-3 py-2 rounded-xl border ${input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      {filteredPlants.length > 0 ? (
        filteredPlants.map((plant, i) => (
          <div
            key={i}
            className={`mb-5 border rounded-xl shadow-sm transition-colors ${card}`}
          >
            <div className={`px-4 py-2 font-semibold text-lg border-b ${hover}`}>
              {plant.name}
            </div>
            <div className="divide-y divide-slate-700/50">
              {plant.lines.map((line, j) => (
                <div key={j} className="px-5 py-3">
                  <div className="font-medium mb-2">🔹 {line.name}</div>
                  <ul className="ml-4 space-y-1 text-sm">
                    {line.files.map((file, k) => (
                      <li
                        key={k}
                        className={`opacity-70 ${hover} px-2 py-1 rounded cursor-default select-none transition-colors`}
                      >
                        {file}.pdf
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center opacity-70 mt-10">
          No se encontraron resultados.
        </div>
      )}

      <div className="text-xs opacity-50 text-center mt-6">
        * Subida de archivos deshabilitada en versión web.
      </div>
    </div>
  );
}
