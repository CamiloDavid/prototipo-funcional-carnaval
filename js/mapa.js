// Mapa ilustrado del centro de Pasto (SVG propio) con base de OpenStreetMap,
// recorridos del KML oficial de la Senda y puntos por capa. Funciona sin conexión.

const COLOR = { rojo: '#D7263D', azul: '#008EC4', verde: '#2EAD68', amarillo: '#F7B801' };
export const COLOR_CAPA = { desfile: COLOR.rojo, eventos: COLOR.azul, salud: COLOR.verde, servicios: COLOR.amarillo };

export function crearProyeccion(base) {
  const [lon0, , , lat1] = base.bbox;
  const s = base.ancho / (base.bbox[2] - base.bbox[0]);
  return (lat, lon) => [(lon - lon0) * s, (lat1 - lat) * s];
}

// Ícono dentro del marcador (24 × 24, centrado en 0,0)
const glifos = {
  eventos: '<path d="M-5 -4h10M-5 0h10M-5 4h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  salud: '<path d="M-1.8 -6h3.6v4.2H6v3.6H1.8V6h-3.6V1.8H-6v-3.6h4.2z" fill="#fff"/>',
  servicios: '<circle r="1.6" cy="-4.5" fill="#fff"/><path d="M0 -1v6.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>'
};

export function marcadorSvg(capa, id, x, y, etiqueta) {
  return `<g class="marca" data-punto="${id}" data-capa="${capa}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" role="button" tabindex="0" aria-label="${etiqueta}">
    <g class="marca-escala"><path d="M0 0C-3 -7 -13 -12 -13 -23a13 13 0 0 1 26 0C13 -12 3 -7 0 0z" fill="${COLOR_CAPA[capa]}" stroke="#fff" stroke-width="2"/>
    <g transform="translate(0 -23)">${glifos[capa]}</g></g></g>`;
}

export function baseSvg(base) {
  const c = base.capas;
  const vias = base.vias.map((v) => `<text x="${v.x}" y="${v.y}" transform="rotate(${v.angulo} ${v.x} ${v.y})" class="mapa-via">${v.texto}</text>`).join('');
  return `
    <rect width="${base.ancho}" height="${base.alto}" fill="#F2EDE3"/>
    <path d="${c.parques}" fill="#D6EACB"/>
    <path d="${c.agua_area ?? ''}" fill="#B9DFF0"/>
    <path d="${c.agua_linea}" fill="none" stroke="#9BD3EA" stroke-width="3" stroke-linecap="round"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${c.menor}" stroke="#DDD5C6" stroke-width="5"/>
      <path d="${c.media}" stroke="#D8CCB4" stroke-width="7.5"/>
      <path d="${c.principal}" stroke="#D9BE7E" stroke-width="10"/>
      <path d="${c.menor}" stroke="#FFFFFF" stroke-width="3.2"/>
      <path d="${c.peatonal}" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="4 3"/>
      <path d="${c.media}" stroke="#FFFFFF" stroke-width="5.5"/>
      <path d="${c.principal}" stroke="#FCE7B2" stroke-width="8"/>
    </g>
    <g class="mapa-vias">${vias}</g>`;
}

export const lineaSvg = (proy, puntos) => 'M' + puntos.map(([la, lo]) => proy(la, lo).map((n) => n.toFixed(1)).join(' ')).join('L');

// Arrastrar, acercar con la rueda o con dos dedos, y botones +/−
export function activarGestos(svg, base, alCambiar) {
  const vista = { x: 0, y: 0, w: base.ancho, h: base.alto };
  const aspecto = () => svg.clientHeight / svg.clientWidth || 1.1;
  const aplicar = () => {
    vista.w = Math.min(Math.max(vista.w, 120), base.ancho * 1.05);
    vista.h = vista.w * aspecto();
    vista.x = Math.min(Math.max(vista.x, -vista.w * 0.3), base.ancho - vista.w * 0.7);
    vista.y = Math.min(Math.max(vista.y, -vista.h * 0.3), base.alto - vista.h * 0.7);
    svg.setAttribute('viewBox', `${vista.x} ${vista.y} ${vista.w} ${vista.h}`);
    alCambiar(vista.w / svg.clientWidth);
  };
  const zoom = (factor, cx = vista.x + vista.w / 2, cy = vista.y + vista.h / 2) => {
    const w = Math.min(Math.max(vista.w * factor, 120), base.ancho * 1.05);
    const f = w / vista.w;
    vista.x = cx - (cx - vista.x) * f;
    vista.y = cy - (cy - vista.y) * f;
    vista.w = w;
    aplicar();
  };
  const encuadrar = ([x0, y0, x1, y1], margen = 60) => {
    const w = Math.max(x1 - x0 + margen * 2, (y1 - y0 + margen * 2) / aspecto());
    vista.w = w; vista.h = w * aspecto();
    vista.x = (x0 + x1) / 2 - w / 2;
    vista.y = (y0 + y1) / 2 - vista.h / 2;
    aplicar();
  };
  const aUnidades = (dx) => dx * (vista.w / svg.clientWidth);

  const dedos = new Map();
  let movido = 0;
  svg.addEventListener('pointerdown', (e) => {
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movido = 0;
  });
  svg.addEventListener('pointermove', (e) => {
    if (!dedos.has(e.pointerId)) return;
    const antes = dedos.get(e.pointerId);
    if (dedos.size === 1) {
      const dx = e.clientX - antes.x, dy = e.clientY - antes.y;
      movido += Math.abs(dx) + Math.abs(dy);
      if (movido > 6) svg.setPointerCapture?.(e.pointerId);
      vista.x -= aUnidades(dx); vista.y -= aUnidades(dy);
      dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
      aplicar();
    } else if (dedos.size === 2) {
      const [a, b] = [...dedos.values()];
      const otro = [...dedos.entries()].find(([id]) => id !== e.pointerId)[1];
      const d0 = Math.hypot(a.x - b.x, a.y - b.y);
      const d1 = Math.hypot(e.clientX - otro.x, e.clientY - otro.y);
      dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
      movido += 10;
      if (d0 > 0 && d1 > 0) zoom(d0 / d1);
    }
  });
  const soltar = (e) => dedos.delete(e.pointerId);
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);
  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    zoom(e.deltaY > 0 ? 1.2 : 1 / 1.2, vista.x + aUnidades(e.clientX - r.left), vista.y + aUnidades(e.clientY - r.top));
  }, { passive: false });

  return { zoom, encuadrar, fueArrastre: () => movido > 6 };
}
