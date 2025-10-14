export type Lang = 'es' | 'en';

const STORAGE_KEY = 'app_lang';

export const DICT = {
  es: {
    // -------------------------
    // LOGIN
    // -------------------------
    login: {
      title: 'Inicia sesión',
      user: 'Usuario',
      pass: 'Contraseña',
      enter: 'Entrar',
    },

    // -------------------------
    // HEADER (menú superior)
    // -------------------------
    header: {
      themeLight: 'Modo claro',
      themeDark: 'Modo oscuro',
      logout: 'Cerrar sesión',
      lang: 'Idioma',
    },

    // -------------------------
    // MENÚ PRINCIPAL
    // -------------------------
    menu: {
      title: 'Menú',
      chat: 'Chat',
      bitacora: 'Bitácora',
      locator: 'Ubicar máquina',
      faqs: 'FAQs',
      library: 'Librería',
      support: 'Soporte',
      newChat: 'Nueva conversación',
      recent: 'Recientes',
      access: 'Accesos',
      machine_label: 'Máquina',
    },

    // -------------------------
    // APPSHELL (barra superior, selector de planta/máquina)
    // -------------------------
    appShell: {
      machine_label: 'Máquina',
      internal_policies: 'Políticas internas',
      select_base: 'Selecciona base',
      plant_north: 'Planta Norte',
      plant_south: 'Planta Sur',
      open_menu: 'Abrir menú',
    },

    // -------------------------
    // CHAT (RAGChat)
    // -------------------------
    chat: {
      title: 'Chat técnico',
      placeholder: 'Escribe tu consulta…',
      send: 'Enviar',
      end: 'Finalizar',
      disabledUpload: 'Subida de archivos deshabilitada en versión web.',
      emptyState:
        'Escanea un QR, ingresa un ID de máquina o comienza a escribir.',
      thinking: 'Pensando…',
      demoCitation: 'Manual de mantenimiento',
    },

    // -------------------------
    // RESUMEN DE CHAT
    // -------------------------
    summary: {
      title: 'Finalizar chat',
      autoTitlePrefix: 'Revisión sobre:',
      autoDescPrefix:
        'Resumen automático del problema detectado:',
      useful: '¿Fue útil esta conversación?',
      yes: 'Sí',
      no: 'No',
      comments: 'Comentarios adicionales',
      back: 'Volver',
      finish: 'Finalizar',
    },

    // -------------------------
    // LIBRERÍA TÉCNICA
    // -------------------------
    library: {
      title: 'Librería técnica',
      search: 'Buscar por planta, línea o máquina…',
      noResults: 'No se encontraron resultados.',
      uploadDisabled: 'Subida de archivos deshabilitada en versión web.',
    },

    // -------------------------
    // BITÁCORA
    // -------------------------
    bitacora: {
      title: 'Bitácora',
      searchPlaceholder: 'Buscar…',
      noResults: 'Sin resultados.',
    },

    // -------------------------
    // LOCALIZADOR
    // -------------------------
    locator: {
      title: 'Ubicación de máquinas',
      search: 'Buscar por ID o nombre de máquina…',
      noResults: 'No se encontró ninguna máquina.',
      scanQR: 'Escanear código QR',
      takePhoto: 'Tomar foto',  
    },

    // -------------------------
    // SOPORTE
    // -------------------------
    support: {
      title: 'Soporte',
      contactText: '¿Necesitas ayuda? Escríbenos a',
      altContact:
        'También puedes abrir un ticket desde n8n o WhatsApp corporativo.',
    },

    // -------------------------
    // FAQS
    // -------------------------
    faqs: {
      title: 'Preguntas frecuentes',
      q_upload: '¿Cómo subo un manual en PDF?',
      a_upload: 'Ve a Documentación → “Subir PDFs” y selecciona los archivos.',
      q_links: '¿Puedo añadir enlaces?',
      a_links: 'Sí, añade el URL en “Añadir enlace”.',
      q_darkmode: '¿Cómo cambio a modo oscuro?',
      a_darkmode: 'Usa el botón de tema arriba a la derecha.',
    },
  },

  // ======================================================
  // ENGLISH VERSION
  // ======================================================
  en: {
    login: {
      title: 'Sign in',
      user: 'User',
      pass: 'Password',
      enter: 'Enter',
    },

    header: {
      themeLight: 'Light mode',
      themeDark: 'Dark mode',
      logout: 'Log out',
      lang: 'Language',
    },

    menu: {
      title: 'Menu',
      chat: 'Chat',
      bitacora: 'Logbook',
      locator: 'Locate machine',
      faqs: 'FAQs',
      library: 'Library',
      support: 'Support',
      newChat: 'New conversation',
      recent: 'Recent',
      access: 'Access',
      machine_label: 'Machine',
    },

    appShell: {
      machine_label: 'Machine',
      internal_policies: 'Internal policies',
      select_base: 'Select base',
      plant_north: 'North Plant',
      plant_south: 'South Plant',
      open_menu: 'Open menu',
    },

    chat: {
      title: 'Technical chat',
      placeholder: 'Type your question…',
      send: 'Send',
      end: 'End chat',
      disabledUpload: 'File uploads are disabled in the web version.',
      emptyState: 'Scan a QR code, enter a machine ID, or start typing.',
      thinking: 'Thinking…',
      demoCitation: 'Maintenance Manual',
    },

    summary: {
      title: 'End chat',
      autoTitlePrefix: 'Review about:',
      autoDescPrefix: 'Automatic summary of detected issue:',
      useful: 'Was this chat useful?',
      yes: 'Yes',
      no: 'No',
      comments: 'Additional comments',
      back: 'Back',
      finish: 'Finish',
    },

    library: {
      title: 'Technical Library',
      search: 'Search by plant, line, or machine…',
      noResults: 'No results found.',
      uploadDisabled: 'File uploads are disabled in the web version.',
    },

    bitacora: {
      title: 'Logbook',
      searchPlaceholder: 'Search…',
      noResults: 'No results found.',
    },

    locator: {
      title: 'Machine location',
      search: 'Search by ID or machine name…',
      noResults: 'No machine found.',
      scanQR: 'Scan QR code',
      takePhoto: 'Take photo',
    },

    support: {
      title: 'Support',
      contactText: 'Need help? Write to us at',
      altContact:
        'You can also open a ticket via n8n or the corporate WhatsApp.',
    },

    faqs: {
      title: 'FAQs',
      q_upload: 'How do I upload a PDF manual?',
      a_upload: 'Go to Documentation → “Upload PDFs” and select your files.',
      q_links: 'Can I add links?',
      a_links: 'Yes, add the URL in “Add link”.',
      q_darkmode: 'How do I switch to dark mode?',
      a_darkmode: 'Use the theme button in the top-right corner.',
    },
  },
} as const;

// ======================================================
// 🔹 Tipos
// ======================================================
export type I18nSection = keyof typeof DICT['es'];
export type I18nKey<S extends I18nSection> = keyof typeof DICT['es'][S];

// ======================================================
// 🔹 Funciones principales
// ======================================================
export function t<S extends I18nSection>(
  lang: Lang,
  section: S,
  key: I18nKey<S>
): string {
  const L = DICT[lang]?.[section] ?? DICT.es[section];
  return (L as any)?.[key] ?? key;
}

// Guardar / obtener idioma en localStorage
export function getSavedLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' || saved === 'es' ? saved : 'es';
}

export function saveLang(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}
