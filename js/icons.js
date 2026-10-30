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
  vacio: trazo('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M8.5 11h5"/>'),
  flecha: trazo('<path d="M9 5l7 7-7 7"/>'),
  grupo: trazo('<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>'),
  trofeo: trazo('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 20h7M10 17h4v3h-4z"/>'),
  bandera: trazo('<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>'),
  ruta: trazo('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>'),
  mas: trazo('<path d="M12 5v14M5 12h14"/>'),
  menos: trazo('<path d="M5 12h14"/>'),
  ubicacion: trazo('<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
  cerrar: trazo('<path d="M6 6l12 12M18 6L6 18"/>'),
  recargar: trazo('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
  salud: trazo('<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z"/>'),
  obra: trazo('<path d="M4 19V8l8-4 8 4v11"/><path d="M4 19h16M9 19v-6h6v6"/>')
};

// Ilustraciones propias para portada y cabeceras (360 × 150)
const colores = ['var(--rojo)', 'var(--amarillo)', 'var(--azul)', 'var(--verde)'];

const banderines = () => Array.from({ length: 10 }, (_, i) => {
  const x = 18 + i * 36;
  const y = 8 + 16 * (1 - ((x - 180) / 180) ** 2);
  return `<path d="M${x - 13} ${y}L${x + 13} ${y}L${x} ${y + 24}z" style="fill:${colores[i % 4]}"/>`;
}).join('');

const confeti = () => [[28, 112, 0], [62, 62, 1], [300, 70, 2], [330, 118, 3], [92, 130, 2], [268, 128, 0], [48, 90, 3], [316, 96, 1]]
  .map(([x, y, c], i) => (i % 2
    ? `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="2" transform="rotate(25 ${x} ${y})" style="fill:${colores[c]}"/>`
    : `<circle cx="${x}" cy="${y}" r="5" style="fill:${colores[c]}"/>`)).join('');

const motivos = {
  desfile: '<rect x="112" y="102" width="136" height="18" rx="6" fill="currentColor"/><circle cx="140" cy="126" r="10" fill="currentColor"/><circle cx="220" cy="126" r="10" fill="currentColor"/><circle cx="180" cy="72" r="28" style="fill:var(--amarillo)"/><circle cx="170" cy="66" r="4" fill="#1F1A17"/><circle cx="190" cy="66" r="4" fill="#1F1A17"/><path d="M168 80q12 10 24 0" stroke="#1F1A17" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M152 60l-14-14M208 60l14-14" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
  musica: '<g fill="currentColor"><ellipse cx="150" cy="112" rx="15" ry="11" transform="rotate(-20 150 112)"/><ellipse cx="214" cy="100" rx="15" ry="11" transform="rotate(-20 214 100)"/><rect x="160" y="50" width="6" height="62"/><rect x="224" y="38" width="6" height="62"/><path d="M160 50l70-12v14l-70 12z"/></g>',
  danza: '<g fill="currentColor"><circle cx="150" cy="56" r="11"/><path d="M150 70l-30 58h60z"/><circle cx="212" cy="56" r="11"/><path d="M212 70l-30 58h60z" style="fill:var(--azul)"/></g><path d="M140 82l-22-22M160 82l20-14M202 82l-20-14M222 82l22-22" stroke="#1F1A17" stroke-width="4" stroke-linecap="round"/>',
  tradicion: `<circle cx="180" cy="88" r="26" fill="currentColor"/>${Array.from({ length: 12 }, (_, i) => `<path d="M180 50v-12" stroke="currentColor" stroke-width="5" stroke-linecap="round" transform="rotate(${i * 30} 180 88)"/>`).join('')}`,
  recreacion: '<circle cx="180" cy="90" r="30" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="180" cy="90" r="10" fill="currentColor"/><path d="M150 128h60" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>'
};
motivos.carroza = motivos.desfile;

export const ilustracion = (motivo) => `<svg class="ilustracion" viewBox="0 0 360 150" aria-hidden="true">${banderines()}${confeti()}${motivos[motivo] ?? ''}</svg>`;

// Marcador del mapa con el color de la capa
export const marcador = (color) => `<svg class="marcador" viewBox="0 0 32 40" aria-hidden="true"><path d="M16 39s13-12.4 13-22.5A13 13 0 0 0 3 16.5C3 26.6 16 39 16 39z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#fff"/></svg>`;
