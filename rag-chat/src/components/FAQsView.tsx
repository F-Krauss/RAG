export default function FAQsView() {
  const faqs = [
    { q: '¿Cómo subo un manual en PDF?', a: 'Ve a Documentación → “Subir PDFs” y selecciona los archivos.' },
    { q: '¿Puedo añadir enlaces?', a: 'Sí, añade el URL en “Añadir enlace”.' },
    { q: '¿Cómo cambio a modo oscuro?', a: 'Usa el botón ☀️/🌙 arriba a la derecha.' },
  ];
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">FAQs</h2>
      <ul className="space-y-3">
        {faqs.map((f,i)=>(
          <li key={i} className="p-3 rounded border">
            <div className="font-medium">{f.q}</div>
            <div className="opacity-80 text-sm">{f.a}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
