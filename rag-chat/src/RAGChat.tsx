import React, { useEffect, useMemo, useRef, useState } from "react";

// RAG Chat – React (Vite) + TypeScript
// ✅ Lee VITE_WEBHOOK_URL y VITE_API_KEY de .env
// ✅ Ajustes guardados en localStorage
// ✅ Historial por hilo (localStorage)
// ✅ Burbujas, loader y citas clicables
// ❗Modo demo: si no hay WEBHOOK_URL, responde mock

// -------------------- Tipos --------------------
export type Citation = { n: number; title?: string; url: string; score?: number };
export type Message = { role: "user" | "assistant" | "system" | "tool"; content: string; citations?: Citation[] };
export type Thread = { id: string; title: string; createdAt: number };
export type Settings = { webhookUrl: string; apiKey?: string; enableStreaming?: boolean };

// -------------------- Helpers --------------------
const LS = {
  settings: "rag.settings",
  threads: "rag.threads",
  messages: (id: string) => `rag.messages.${id}`,
};

const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`);
const loadJSON = <T,>(k: string, def: T): T => { try { return JSON.parse(localStorage.getItem(k) || ""); } catch { return def; } };
const saveJSON = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));
const mdEscape = (s: string) => s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const trimHistory = (msgs: Message[], limit = 16) => (msgs.length <= limit ? msgs : msgs.slice(-limit));

// -------------------- UI utils --------------------
function IconSettings(){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M19.4 15a8.5 8.5 0 0 0 0-2l2.02-1.58a.5.5 0 0 0 .12-.64l-1.91-3.3a.5.5 0 0 0-.6-.22l-2.38.96a8.5 8.5 0 0 0-1.72-1L14.5 2.6a.5.5 0 0 0-.5-.4h-3a.5.5 0 0 0-.5.4L9.05 5.22a8.5 8.5 0 0 0-1.72 1l-2.38-.96a.5.5 0 0 0-.6.22l-1.9 3.3a.5.5 0 0 0 .12.64L4.6 13a8.5 8.5 0 0 0 0 2l-2.02 1.58a.5.5 0 0 0-.12.64l1.9 3.3a.5.5 0 0 0 .6.22l2.38-.96c.53.4 1.11.74 1.72 1l1.45 2.62a.5.5 0 0 0 .5.4h3a.5.5 0 0 0 .5-.4l1.45-2.62c.61-.26 1.19-.6 1.72-1l2.38.96a.5.5 0 0 0 .6-.22l1.91-3.3a.5.5 0 0 0-.12-.64L19.4 15Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function IconSend(){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11l18-8-8 18-2-7-8-3Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
const LoaderDots = () => (
  <span className="inline-flex gap-1 items-center ml-2">
    <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"/>
    <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse [animation-delay:120ms]"/>
    <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse [animation-delay:240ms]"/>
  </span>
);
const Bubble = ({role, children}:{role:Message["role"], children:React.ReactNode}) => (
  <div className={`w-full flex ${role==='user'?'justify-end':'justify-start'}`}>
    <div className={`${role==='user'?'bg-blue-600 text-white':'bg-slate-800 text-slate-100'} px-4 py-3 rounded-2xl max-w-[75%] whitespace-pre-wrap leading-relaxed shadow`}>{children}</div>
  </div>
);
const Citations = ({list}:{list?:Citation[]}) => !list?.length ? null : (
  <div className="mt-2 text-sm opacity-80 space-x-2">
    {list.map(c=> (
      <a key={`${c.n}_${c.url}`} className="underline text-blue-300 hover:text-blue-200" href={c.url} target="_blank" rel="noreferrer">[{c.n}] {c.title || c.url}</a>
    ))}
  </div>
);

// -------------------- Componente principal --------------------
export default function RAGChat(){
  const envURL = (import.meta as any).env?.VITE_WEBHOOK_URL || "";
  const envKey = (import.meta as any).env?.VITE_API_KEY || "";

  const initialSettings: Settings = { enableStreaming:false, webhookUrl: envURL, apiKey: envKey, ...(loadJSON<Partial<Settings>>(LS.settings, {} as Partial<Settings>)) } as Settings;
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const initialThreads = loadJSON<Thread[]>(LS.threads, []);
  const [threads, setThreads] = useState<Thread[]>(()=>{
    if (initialThreads.length) return initialThreads;
    const t: Thread = { id: uuid(), title: "Nueva conversación", createdAt: Date.now() };
    saveJSON(LS.threads, [t]);
    return [t];
  });
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0].id);
  const [messages, setMessages] = useState<Message[]>(()=> loadJSON<Message[]>(LS.messages(threads[0].id), []));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(()=> saveJSON(LS.settings, settings), [settings]);
  useEffect(()=> saveJSON(LS.threads, threads), [threads]);
  useEffect(()=> saveJSON(LS.messages(activeThreadId), messages), [activeThreadId, messages]);
  useEffect(()=> chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }), [messages, busy]);
  useEffect(()=> setMessages(loadJSON<Message[]>(LS.messages(activeThreadId), [])), [activeThreadId]);

  const activeThread = useMemo(()=> threads.find(t=>t.id===activeThreadId)!, [threads, activeThreadId]);

  function newThread(){
    const t: Thread = { id: uuid(), title: 'Nueva conversación', createdAt: Date.now() };
    const list = [t, ...threads];
    setThreads(list); setActiveThreadId(t.id); setMessages([]);
  }
  function deleteThread(id:string){
    const list = threads.filter(t=>t.id!==id);
    setThreads(list); localStorage.removeItem(LS.messages(id));
    if (activeThreadId===id && list.length) setActiveThreadId(list[0].id);
  }

  async function sendMessage(){
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    const userMsg: Message = { role:'user', content:text };
    const loading: Message = { role:'assistant', content:'Pensando…' };
    setMessages(prev=>[...prev, userMsg, loading]);
    setBusy(true);

    // Modo demo si no hay URL configurada
    if (!settings.webhookUrl){
      await new Promise(r=>setTimeout(r, 500));
      setMessages(prev=>{ const u=[...prev]; u[u.length-1] = { role:'assistant', content:'(Demo) Aquí iría la respuesta del RAG.', citations:[{n:1,title:'Doc de ejemplo',url:'https://example.com'}] }; return u; });
      setBusy(false); return;
    }

    try{
      const body = { thread_id: activeThreadId, user_id: 'browser', message: text, history: trimHistory(messages) };
      const ctrl = new AbortController();
      const to = setTimeout(()=> ctrl.abort(), 20000);
      const res = await fetch(settings.webhookUrl, {
        method:'POST', headers:{ 'Content-Type':'application/json', ...(settings.apiKey?{'X-API-Key':settings.apiKey}:{}) }, body: JSON.stringify(body), signal: ctrl.signal
      });
      clearTimeout(to);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const answer = String(data.answer ?? '');
      const citations: Citation[] = Array.isArray(data.citations) ? data.citations : [];

      setMessages(prev=>{
        const u=[...prev];
        u[u.length-1] = { role:'assistant', content:answer, citations };
        if (prev.length<=2 && answer){
          const title = text.length>42? text.slice(0,42)+'…' : text;
          setThreads(ts=> ts.map(t=> t.id===activeThreadId ? {...t, title}: t));
        }
        return u;
      });
    } catch(e:any){
      console.error(e);
      setMessages(prev=>{ const u=[...prev]; u[u.length-1] = { role:'assistant', content:`Error al obtener respuesta. ${e?.message||''}` }; return u; });
    } finally{ setBusy(false); }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>){ if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } }

  return (
    <div className="h-screen w-full bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-72 border-r border-slate-800 p-3 gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold opacity-80">Conversaciones</h2>
          <button className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700" onClick={newThread}>Nuevo</button>
        </div>
        <div className="flex-1 overflow-auto space-y-1">
          {threads.map(t=> (
            <button key={t.id} onClick={()=> setActiveThreadId(t.id)} className={`w-full text-left px-3 py-2 rounded hover:bg-slate-800 ${t.id===activeThreadId? 'bg-slate-800':''}`}>
              <div className="text-sm truncate">{t.title}</div>
              <div className="text-[11px] opacity-60">{new Date(t.createdAt).toLocaleString()}</div>
            </button>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-800">
          <button className="text-xs opacity-80 hover:opacity-100" onClick={()=>{ if (confirm('¿Eliminar esta conversación?')) deleteThread(activeThreadId); }}>Eliminar conversación</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 h-full grid grid-rows-[auto,1fr,auto]">
        {/* Top bar */}
        <div className="flex items-center justify-between p-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-80">RAG Empresarial</span>
            {busy && <span className="text-xs inline-flex items-center">Generando<LoaderDots/></span>}
          </div>
          {/* Settings */}
          <details className="relative">
            <summary className="list-none cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm"><IconSettings/> Ajustes</summary>
            <div className="absolute right-0 mt-2 w-[420px] max-w-[90vw] bg-slate-800 border border-slate-700 rounded-xl p-4 z-10 shadow-xl">
              <div className="text-sm font-semibold mb-2">Conexión</div>
              <label className="text-xs opacity-80">Webhook URL</label>
              <input className="w-full mt-1 mb-2 px-3 py-2 rounded bg-slate-900 border border-slate-700 outline-none" placeholder="https://tu-n8n/webhook/chat" value={settings.webhookUrl||''} onChange={e=> setSettings(s=> ({...s, webhookUrl:e.target.value}))}/>
              <label className="text-xs opacity-80">API Key (opcional)</label>
              <input className="w-full mt-1 mb-2 px-3 py-2 rounded bg-slate-900 border border-slate-700 outline-none" placeholder="X-API-Key" value={settings.apiKey||''} onChange={e=> setSettings(s=> ({...s, apiKey:e.target.value}))}/>
              <div className="flex items-center gap-2 mt-1">
                <input id="stream" type="checkbox" className="accent-blue-500" checked={!!settings.enableStreaming} onChange={e=> setSettings(s=> ({...s, enableStreaming:e.target.checked}))}/>
                <label htmlFor="stream" className="text-sm">Streaming (SSE) — requiere proxy</label>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button className="px-3 py-1.5 text-sm rounded bg-slate-700 hover:bg-slate-600" onClick={()=>{ localStorage.clear(); location.reload(); }}>Reset total</button>
                <button className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-500" onClick={(e)=>{ (e.currentTarget.closest('details') as HTMLDetailsElement).open = false; }}>Cerrar</button>
              </div>
            </div>
          </details>
        </div>

        {/* Chat */}
        <div ref={chatRef} className="overflow-auto p-4 space-y-3">
          {!messages.length && <div className="opacity-70 text-sm">👋 Escribe tu primera pregunta. El historial reciente se enviará al Webhook de n8n.</div>}
          {messages.map((m, i)=> (
            <Bubble key={i} role={m.role}>
              <div dangerouslySetInnerHTML={{__html: mdEscape(m.content)}}/>
              <Citations list={m.citations}/>
            </Bubble>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-slate-800 p-3">
          <div className="flex gap-2 items-end">
            <textarea value={input} onChange={e=> setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Escribe y Enter (Shift+Enter nueva línea)…" className="flex-1 resize-none rounded-xl bg-slate-800 border border-slate-700 outline-none px-3 py-2 min-h-[44px] max-h-[180px]"/>
            <button onClick={sendMessage} disabled={busy || !input.trim()} className="px-4 py-2 rounded-xl bg-green-500 text-slate-900 font-semibold disabled:opacity-50 inline-flex items-center gap-2"><IconSend/>Enviar</button>
          </div>
        </div>
      </main>
    </div>
  );
}
