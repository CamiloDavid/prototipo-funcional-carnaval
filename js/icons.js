// Íconos propios del prototipo (trazo 2 px, 24 × 24)
const trazo = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const iconos = {
  inicio: trazo('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  agenda: trazo('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14h2M11 14h2M14.5 14h2M7.5 17.5h2M11 17.5h2"/>'),
  mapa: trazo('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  corazon: trazo('<path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.4 3.8 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.2 0 5.4 2.9 4.2 6.2C19.5 15.4 12 20 12 20z"/>'),
  cultura: trazo('<path d="M4 5c3 1.3 5.3 1.3 8 0 2.7 1.3 5 1.3 8 0v6c0 5-3.6 8.5-8 9.5C7.6 19.5 4 16 4 11z"/><path d="M8.5 10.5h1.5M14 10.5h1.5"/><path d="M9 14.5c1.8 1.4 4.2 1.4 6 0"/>'),
  buscar: trazo('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  filtro: trazo('<path d="M4 6h16M7 12h10M10 18h4"/>'),
  reloj: trazo('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  lugar: trazo('<path d="M12 21s-6-5.4-6-10a6 6 0 0 1 12 0c0 4.6-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>'),
  campana: trazo('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  atras: trazo('<path d="M15 5l-7 7 7 7"/>'),
  telefono: trazo('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>'),
  ajustes: trazo('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  sinConexion: trazo('<path d="M3 3l18 18"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 12.5a10 10 0 0 1 4.3-2.4M19 12.5a10 10 0 0 0-2.6-1.8"/><path d="M2 8.8a15 15 0 0 1 5-2.9M22 8.8A15 15 0 0 0 11 5"/><circle cx="12" cy="20" r="1"/>'),
  check: trazo('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  info: trazo('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  vacio: trazo('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M8.5 11h5"/>')
};

// Marcador del mapa con el color de la capa
export const marcador = (color) => `<svg class="marcador" viewBox="0 0 32 40" aria-hidden="true"><path d="M16 39s13-12.4 13-22.5A13 13 0 0 0 3 16.5C3 26.6 16 39 16 39z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#fff"/></svg>`;
