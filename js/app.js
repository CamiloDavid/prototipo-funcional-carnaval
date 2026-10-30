import { iconos, ilustracion } from './icons.js';
import { crearProyeccion, baseSvg, marcadorSvg, lineaSvg, activarGestos, COLOR_CAPA } from './mapa.js';

const $pantalla = document.getElementById('pantalla');
const $nav = document.getElementById('nav');
let datos = null;

const pestañas = [
  { ruta: '#/', nombre: 'Inicio', icono: 'inicio' },
  { ruta: '#/agenda', nombre: 'Agenda', icono: 'agenda' },
  { ruta: '#/mapa', nombre: 'Mapa', icono: 'mapa' },
  { ruta: '#/favoritos', nombre: 'Favoritos', icono: 'corazon' },
  { ruta: '#/cultura', nombre: 'Cultura', icono: 'cultura' }
];

// Estado de la agenda: se conserva al ir al detalle y volver
const agenda = { dia: null, texto: '', categoria: 'todas', lugar: 'todos', scroll: 0 };

// Favoritos guardados en el navegador (siguen ahí al reabrir)
const CLAVE_FAVORITOS = 'cnb-favoritos';
const favoritos = new Set(leer(CLAVE_FAVORITOS, []));
function leer(clave, porDefecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? porDefecto; } catch { return porDefecto; }
}
function guardarFavoritos() {
  try { localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify([...favoritos])); } catch { /* sin almacenamiento */ }
}

// Recordatorios: minutos de anticipación por evento favorito (HU-16)
const CLAVE_RECORDATORIOS = 'cnb-recordatorios';
const recordatorios = leer(CLAVE_RECORDATORIOS, {});
function guardarRecordatorios() {
  try { localStorage.setItem(CLAVE_RECORDATORIOS, JSON.stringify(recordatorios)); } catch { /* sin almacenamiento */ }
}

// Utilidades
const porId = (lista, id) => lista.find((x) => x.id === id);
const categoria = (id) => porId(datos.categorias, id);
const lugar = (id) => porId(datos.lugares, id);
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const horaTexto = (h) => {
  if (!h) return { hora: '—', sufijo: 'por confirmar' };
  const [hh, mm] = h.split(':').map(Number);
  return { hora: `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`, sufijo: hh < 12 ? 'a. m.' : 'p. m.' };
};
const horaCompleta = (h) => { const t = horaTexto(h); return `${t.hora} ${t.sufijo}`; };
const horario = (ev) => (ev.horaFin ? `${horaCompleta(ev.hora)} – ${horaCompleta(ev.horaFin)}` : `Desde las ${horaCompleta(ev.hora)}`);
const NOMBRE_DIA = { Lun: 'Lunes', Mar: 'Martes', Mié: 'Miércoles', Jue: 'Jueves', Vie: 'Viernes', Sáb: 'Sábado', Dom: 'Domingo' };
const MES = { dic: 'diciembre', ene: 'enero' };
function fechaLarga(fecha) {
  const d = datos.dias.find((x) => x.fecha === fecha);
  const [n, m] = d.etiqueta.split(' ');
  return `${NOMBRE_DIA[d.dia]} ${n} de ${MES[m]}`;
}
const textoBusqueda = new Map();
function buscable(ev) {
  if (!textoBusqueda.has(ev.id)) {
    const partes = [ev.nombre, lugar(ev.lugar).nombre, categoria(ev.categoria).nombre, ev.concentracion ?? '',
      ...ev.colectivos.map((c) => porId(datos.colectivos, c).nombre), ...ev.participantes.map((p) => p.nombre)];
    textoBusqueda.set(ev.id, normalizar(partes.join(' ')));
  }
  return textoBusqueda.get(ev.id);
}

const botonFavorito = (id) => `<button class="fav" data-fav="${id}" aria-pressed="${favoritos.has(id)}" aria-label="Guardar en favoritos">${iconos.corazon}</button>`;
const barraSuperior = (volver, titulo, extra = '<span></span>') => `
  <div class="barra-superior">
    <a class="btn-icono" href="${volver}" data-atras aria-label="Volver">${iconos.atras}</a>
    <span>${titulo}</span>${extra}
  </div>`;

function tarjetaEvento(ev) {
  const cat = categoria(ev.categoria);
  const h = horaTexto(ev.hora);
  return `
    <article class="tarjeta-evento">
      <div class="hora">${h.hora}<small>${h.sufijo}</small></div>
      <div>
        <span class="etiqueta etiqueta--${cat.color}">${cat.nombre}</span>
        <h3><a class="enlace-tarjeta" href="#/evento/${ev.id}">${ev.nombre}</a></h3>
        <p class="lugar">${iconos.lugar}${lugar(ev.lugar).nombre}</p>
      </div>
      ${botonFavorito(ev.id)}
    </article>`;
}

// Inicio (HU-01)
function pantallaInicio() {
  const accesos = [
    { ruta: '#/agenda', nombre: 'Agenda', texto: 'Programación día a día', icono: 'agenda', color: 'rojo' },
    { ruta: '#/mapa', nombre: 'Mapa', texto: 'Recorridos, salud y servicios', icono: 'mapa', color: 'azul' },
    { ruta: '#/favoritos', nombre: 'Favoritos', texto: 'Tus eventos y recordatorios', icono: 'corazon', color: 'amarillo' },
    { ruta: '#/cultura', nombre: 'Cultura', texto: 'El sentido de cada jornada', icono: 'cultura', color: 'verde' }
  ];
  return `
    <section class="portada">
      ${ilustracion()}
      <p class="portada-edicion">Edición ${datos.edicion} · 28 dic – 7 ene</p>
      <h1>Carnaval de Negros y Blancos</h1>
      <p>«${datos.lema}»</p>
    </section>
    <h2 class="titulo-seccion">¿Qué quieres consultar?</h2>
    <nav class="accesos" aria-label="Secciones">
      ${accesos.map((a) => `
        <a class="acceso acceso--${a.color}" href="${a.ruta}">
          <span class="acceso-icono">${iconos[a.icono]}</span>
          <b>${a.nombre}</b><small>${a.texto}</small>
        </a>`).join('')}
    </nav>
    <div class="lista-enlaces informacion">
      <a class="enlace-fila" href="#/informacion">
        <span class="avatar avatar--azul">${iconos.info}</span>
        <span><b>Información práctica</b><small>Emergencias, salud y normas, sin conexión</small></span>${iconos.flecha}
      </a>
      <a class="enlace-fila" href="#/movilidad">
        <span class="avatar avatar--verde">${iconos.ruta}</span>
        <span><b>Cómo moverse</b><small>Cierres y restricciones de cada día</small></span>${iconos.flecha}
      </a>
    </div>`;
}

// 01 Agenda por días (HU-02, HU-03, HU-04)
function pantallaAgenda(_, params) {
  if (params.get('dia')) { agenda.dia = params.get('dia'); agenda.texto = ''; }
  agenda.dia ??= datos.dias[0].fecha;
  const chip = (filtro, valor, nombre) => `<button class="chip" data-filtro="${filtro}" data-valor="${valor}" aria-pressed="${agenda[filtro] === valor}">${nombre}</button>`;
  return `
    <header class="encabezado"><div><h1>Agenda</h1><p class="sub">28 dic – 7 ene · ${datos.eventos.length} eventos</p></div></header>
    <label class="buscador">${iconos.buscar}<span class="oculto-visual">Buscar</span>
      <input id="buscar" type="search" placeholder="Busca un evento, colectivo o lugar" value="${esc(agenda.texto)}" autocomplete="off">
    </label>
    <div class="fila-chips" id="dias" role="group" aria-label="Día">
      ${datos.dias.map((d) => `<button class="chip-dia" data-dia="${d.fecha}" aria-pressed="${d.fecha === agenda.dia}"><small>${d.dia}</small><b>${d.etiqueta.split(' ')[0]}</b><small>${d.etiqueta.split(' ')[1]}</small></button>`).join('')}
    </div>
    <div class="fila-chips" role="group" aria-label="Categoría">
      ${chip('categoria', 'todas', 'Todas')}${datos.categorias.map((c) => chip('categoria', c.id, c.nombre)).join('')}
    </div>
    <div class="fila-chips" role="group" aria-label="Lugar">
      ${chip('lugar', 'todos', 'Todos los lugares')}${datos.filtrosLugar.map((l) => chip('lugar', l.id, l.nombre)).join('')}
    </div>
    <div class="resumen-lista"><span id="conteo" aria-live="polite"></span><button id="limpiar" class="btn btn--texto">Limpiar filtros</button></div>
    <div id="lista"></div>`;
}

function montarAgenda() {
  actualizarAgenda();
  const $dias = document.getElementById('dias');
  const $activo = $dias.querySelector('[aria-pressed="true"]');
  $dias.scrollLeft = $activo.offsetLeft - ($dias.clientWidth - $activo.offsetWidth) / 2;
  $pantalla.scrollTop = agenda.scroll;
}

function actualizarAgenda() {
  const consulta = normalizar(agenda.texto.trim());
  const buscando = consulta.length >= 3;
  const eventos = datos.eventos
    .filter((e) => (buscando ? buscable(e).includes(consulta) : e.fecha === agenda.dia))
    .filter((e) => agenda.categoria === 'todas' || e.categoria === agenda.categoria)
    .filter((e) => agenda.lugar === 'todos' || lugar(e.lugar).filtro === agenda.lugar)
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  $pantalla.querySelectorAll('[data-dia]').forEach((b) => b.setAttribute('aria-pressed', !buscando && b.dataset.dia === agenda.dia));
  $pantalla.querySelectorAll('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', agenda[b.dataset.filtro] === b.dataset.valor));
  document.getElementById('dias').classList.toggle('fila-chips--apagada', buscando);
  document.getElementById('limpiar').hidden = !(agenda.texto || agenda.categoria !== 'todas' || agenda.lugar !== 'todos');

  const n = eventos.length;
  document.getElementById('conteo').textContent = buscando
    ? `${n} ${n === 1 ? 'resultado' : 'resultados'} en todos los días`
    : `${n} ${n === 1 ? 'evento' : 'eventos'} · ${fechaLarga(agenda.dia)}`;

  let html;
  if (!n) {
    html = `<div class="vacio">${iconos.vacio}<p><b>Sin resultados</b><br>${buscando ? `No hay eventos que coincidan con «${esc(agenda.texto.trim())}».` : 'No hay eventos con estos filtros en este día.'}</p></div>`;
  } else if (buscando) {
    const fechas = [...new Set(eventos.map((e) => e.fecha))];
    html = fechas.map((f) => `<h2 class="titulo-dia">${fechaLarga(f)}</h2>${eventos.filter((e) => e.fecha === f).map(tarjetaEvento).join('')}`).join('');
  } else {
    html = eventos.map(tarjetaEvento).join('');
  }
  document.getElementById('lista').innerHTML = html;
}

// 02 Detalle de evento (HU-05)
function pantallaEvento([id]) {
  const ev = porId(datos.eventos, id);
  if (!ev) return noEncontrado();
  const cat = categoria(ev.categoria);
  const lu = lugar(ev.lugar);
  const colectivos = ev.colectivos.map((c) => porId(datos.colectivos, c));
  const dato = (icono, etiqueta, valor) => `<div class="dato">${iconos[icono]}<span class="dato-etiqueta">${etiqueta}</span><span class="dato-valor">${valor}</span></div>`;
  return `
    ${barraSuperior('#/agenda', 'Detalle del evento', botonFavorito(ev.id))}
    <div class="cabecera-ilustrada cabecera--${cat.color}">${ilustracion(ev.categoria)}</div>
    <span class="etiqueta etiqueta--${cat.color}">${cat.nombre}</span>
    <h1 class="titulo-detalle">${ev.nombre}</h1>
    <div class="datos-evento">
      ${dato('agenda', 'Fecha', fechaLarga(ev.fecha))}
      ${dato('reloj', 'Horario', horario(ev))}
      ${dato('lugar', 'Lugar', `${lu.nombre}<small>${lu.direccion}</small>`)}
      ${ev.concentracion ? dato('bandera', 'Concentración', ev.concentracion) : ''}
      ${ev.finalizacion ? dato('bandera', 'Finalización', ev.finalizacion) : ''}
    </div>
    <div class="acciones">
      <a class="btn btn--secundario" href="#/mapa?evento=${ev.id}">${iconos.mapa}Ver en mapa</a>
      <button class="btn" data-recordar="${ev.id}">${iconos.campana}Recordarme</button>
    </div>
    <div id="aviso-detalle" aria-live="polite"></div>
    <h2 class="titulo-seccion">Descripción</h2>
    <p class="texto">${ev.descripcion}</p>
    <h2 class="titulo-seccion">${colectivos.length ? 'Colectivos participantes' : 'Participantes'}</h2>
    ${colectivos.length ? `<div class="lista-enlaces">${colectivos.map((c) => `
      <a class="enlace-fila" href="#/colectivo/${c.id}">
        <span class="avatar avatar--${c.tipo === 'Carroza' ? 'rojo' : 'amarillo'}">${iconos.grupo}</span>
        <span><b>${c.nombre}</b><small>${c.tipo}${c.categoria && c.categoria !== c.tipo ? ` · ${c.categoria}` : ''}</small></span>${iconos.flecha}
      </a>`).join('')}</div>` : ''}
    ${ev.participantes.length ? `<ul class="lista-participantes">${ev.participantes.map((p) => `<li><span>${p.nombre}</span><small>${p.cantidad ?? p.tipo ?? ''}</small></li>`).join('')}</ul>` : ''}
    ${!colectivos.length && !ev.participantes.length ? '<p class="texto">La programación oficial no publica los participantes de este evento.</p>' : ''}`;
}

// 07 Ficha de carroza o colectivo (HU-06)
function pantallaColectivo([id]) {
  const c = porId(datos.colectivos, id);
  if (!c) return noEncontrado();
  const jornada = porId(datos.jornadas, c.jornada);
  const eventos = datos.eventos.filter((e) => e.colectivos.includes(c.id));
  const esCarroza = c.tipo === 'Carroza';
  const dato = (icono, etiqueta, valor) => `<div class="dato">${iconos[icono]}<span class="dato-etiqueta">${etiqueta}</span><span class="dato-valor">${valor}</span></div>`;
  return `
    ${barraSuperior('#/agenda', esCarroza ? 'Ficha de la carroza' : 'Ficha del colectivo')}
    <div class="cabecera-ilustrada cabecera--${esCarroza ? 'rojo' : 'amarillo'}">${ilustracion(esCarroza ? 'carroza' : 'danza')}</div>
    <span class="etiqueta etiqueta--${esCarroza ? 'rojo' : 'amarillo'}">${c.tipo}</span>
    <h1 class="titulo-detalle">${c.nombre}</h1>
    <div class="datos-evento">
      ${dato('grupo', 'Categoría', c.categoria ?? 'Sin categoría publicada')}
      ${dato('agenda', 'Jornada', `${jornada.nombre}<small>${fechaLarga(jornada.fechas[0])}</small>`)}
      ${c.obra ? dato('obra', 'Obra', `«${c.obra}»`) : ''}
      ${c.resultado ? dato('trofeo', 'Resultado', c.resultado) : ''}
    </div>
    <h2 class="titulo-seccion">Descripción</h2>
    <p class="texto">${c.descripcion}</p>
    <h2 class="titulo-seccion">Participa en</h2>
    <div class="lista-enlaces">${eventos.map((e) => `
      <a class="enlace-fila" href="#/evento/${e.id}">
        <span class="avatar avatar--${categoria(e.categoria).color}">${iconos.agenda}</span>
        <span><b>${e.nombre}</b><small>${fechaLarga(e.fecha)} · ${horaCompleta(e.hora)}</small></span>${iconos.flecha}
      </a>`).join('')}</div>`;
}

// 03 Mapa (HU-10, HU-11, HU-12)
const mapa = { capas: { desfile: true, eventos: true, salud: true, servicios: true }, desfile: null, seleccion: null, base: null, k: 1, gestos: null };
const NOMBRE_CAPA = { desfile: 'Desfile', eventos: 'Eventos', salud: 'Salud', servicios: 'Servicios' };
const nombreCorto = (ev) => ev.nombre.replace(/^(Desfile de |Llegada de la )/, '');
const comoLlegar = (lat, lon) => `<a class="btn btn--secundario" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}" target="_blank" rel="noopener">${iconos.ruta}Cómo llegar</a>`;

function pantallaMapa(_, params) {
  if (params.get('evento')) {
    const ev = porId(datos.eventos, params.get('evento'));
    const rec = datos.recorridos.find((r) => r.evento === ev?.id);
    if (rec) { mapa.desfile = rec.evento; mapa.capas.desfile = true; mapa.seleccion = { tipo: 'recorrido', id: rec.evento }; }
    else if (ev) { mapa.capas.eventos = true; mapa.seleccion = { tipo: 'lugar', id: ev.lugar }; }
  } else if (params.get('punto')) {
    const p = porId(datos.puntos, params.get('punto'));
    if (p) { mapa.capas[p.capa] = true; mapa.seleccion = { tipo: 'punto', id: p.id }; }
  }
  return `
    <header class="encabezado encabezado--fila">
      <div><h1>Mapa</h1><p class="sub">Centro de Pasto y Senda del Carnaval</p></div>
      <span class="insignia">${iconos.check}Disponible sin conexión</span>
    </header>
    <div class="fila-chips" role="group" aria-label="Capas del mapa">
      ${Object.keys(mapa.capas).map((c) => `<button class="chip chip--capa" data-capa-mapa="${c}" aria-pressed="${mapa.capas[c]}"><i style="background:${COLOR_CAPA[c]}"></i>${NOMBRE_CAPA[c]}</button>`).join('')}
    </div>
    <div class="fila-chips" role="group" aria-label="Recorrido del desfile">
      ${datos.recorridos.map((r) => { const ev = porId(datos.eventos, r.evento); return `<button class="chip" data-desfile="${r.evento}" aria-pressed="${mapa.desfile === r.evento}">${nombreCorto(ev)} · ${datos.dias.find((d) => d.fecha === ev.fecha).etiqueta}</button>`; }).join('')}
    </div>
    <div class="mapa" id="mapa">
      <svg id="mapa-svg" class="mapa-svg" role="img" aria-label="Mapa del centro de Pasto"></svg>
      <div class="mapa-controles">
        <button class="btn-icono" data-zoom="0.7" aria-label="Acercar">${iconos.mas}</button>
        <button class="btn-icono" data-zoom="1.4" aria-label="Alejar">${iconos.menos}</button>
        <button class="btn-icono" data-ubicacion aria-label="Mi ubicación">${iconos.ubicacion}</button>
      </div>
      <small class="mapa-atribucion">© colaboradores de OpenStreetMap</small>
      <div id="mapa-tarjeta" class="mapa-tarjeta" aria-live="polite"></div>
    </div>`;
}

async function montarMapa() {
  try {
    if (!mapa.base) mapa.base = await (await fetch('data/mapa-pasto.json')).json();
  } catch {
    const $t = document.getElementById('mapa-tarjeta');
    if ($t) $t.innerHTML = '<div class="tarjeta-mapa"><p>No se pudo cargar el mapa. Abre la app una vez con conexión para guardarlo en el celular.</p></div>';
    return;
  }
  const svg = document.getElementById('mapa-svg');
  if (!svg) return;
  const proy = crearProyeccion(mapa.base);
  svg.innerHTML = `${baseSvg(mapa.base)}<g id="capa-recorrido"></g><g id="capa-marcas"></g><g id="capa-yo"></g>`;
  mapa.gestos = activarGestos(svg, mapa.base, (k) => {
    mapa.k = k;
    svg.style.setProperty('--k', k);
    svg.classList.toggle('mapa-svg--cerca', k < 1.3);
  });
  dibujarMapa();
  const rec = datos.recorridos.find((r) => r.evento === mapa.desfile) ?? datos.recorridos[0];
  const sel = mapa.seleccion;
  if (sel?.tipo === 'lugar' || sel?.tipo === 'punto') {
    const p = sel.tipo === 'lugar' ? lugar(sel.id) : porId(datos.puntos, sel.id);
    if (p?.lat) { const [x, y] = proy(p.lat, p.lon); mapa.gestos.encuadrar([x - 90, y - 120, x + 90, y + 60], 0); }
    else mapa.gestos.encuadrar(cajaDe(rec.trazado));
  } else {
    mapa.gestos.encuadrar(cajaDe(rec.trazado));
  }
  mostrarTarjeta();
}

const cajaDe = (trazado) => {
  const proy = crearProyeccion(mapa.base);
  const xy = trazado.map(([la, lo]) => proy(la, lo));
  return [Math.min(...xy.map((p) => p[0])), Math.min(...xy.map((p) => p[1])), Math.max(...xy.map((p) => p[0])), Math.max(...xy.map((p) => p[1]))];
};

function dibujarMapa() {
  const proy = crearProyeccion(mapa.base);
  const $rec = document.getElementById('capa-recorrido');
  const $marcas = document.getElementById('capa-marcas');
  if (!$rec) return;

  let rutas = '';
  if (mapa.capas.desfile) {
    const rec = datos.recorridos.find((r) => r.evento === mapa.desfile);
    const trazado = rec ? rec.trazado : datos.recorridos.reduce((a, r) => (r.trazado.length > a.length ? r.trazado : a), []);
    const d = lineaSvg(proy, trazado);
    rutas = `<path d="${d}" class="ruta-borde" vector-effect="non-scaling-stroke"/>
      <path d="${d}" class="ruta ${rec ? '' : 'ruta--suave'}" vector-effect="non-scaling-stroke" data-recorrido="${rec?.evento ?? ''}"/>`;
    if (rec) {
      const [xa, ya] = proy(rec.concentracion.lat, rec.concentracion.lon);
      const [xb, yb] = proy(rec.finalizacion.lat, rec.finalizacion.lon);
      rutas += `<g transform="translate(${xa.toFixed(1)} ${ya.toFixed(1)})"><g class="marca-escala"><circle r="11" fill="#2EAD68" stroke="#fff" stroke-width="3"/><text class="ruta-letra" y="4.5">S</text></g></g>
        <g transform="translate(${xb.toFixed(1)} ${yb.toFixed(1)})"><g class="marca-escala"><circle r="11" fill="#1F1A17" stroke="#fff" stroke-width="3"/><text class="ruta-letra" y="4.5">L</text></g></g>`;
    }
  }
  $rec.innerHTML = rutas;

  let marcas = '';
  if (mapa.capas.eventos) {
    datos.lugares.filter((l) => l.lat && l.id !== 'senda' && datos.eventos.some((e) => e.lugar === l.id)).forEach((l) => {
      const [x, y] = proy(l.lat, l.lon);
      marcas += marcadorSvg('eventos', `lugar:${l.id}`, x, y, l.nombre);
    });
  }
  datos.puntos.filter((p) => mapa.capas[p.capa]).forEach((p) => {
    const [x, y] = proy(p.lat, p.lon);
    marcas += marcadorSvg(p.capa, `punto:${p.id}`, x, y, p.nombre);
  });
  $marcas.innerHTML = marcas;
  const sel = mapa.seleccion;
  if (sel) $marcas.querySelector(`[data-punto="${sel.tipo === 'lugar' ? 'lugar' : 'punto'}:${sel.id}"]`)?.classList.add('marca--activa');
}

function mostrarTarjeta() {
  const $t = document.getElementById('mapa-tarjeta');
  if (!$t) return;
  const sel = mapa.seleccion;
  const cerrar = `<button class="btn-icono tarjeta-cerrar" data-cerrar-tarjeta aria-label="Cerrar">${iconos.cerrar}</button>`;
  if (!sel) { $t.innerHTML = ''; return; }
  let html = '';
  if (sel.tipo === 'recorrido') {
    const rec = datos.recorridos.find((r) => r.evento === sel.id);
    const ev = porId(datos.eventos, rec.evento);
    html = `<span class="etiqueta etiqueta--rojo">Recorrido · ${fechaLarga(ev.fecha)}</span><h3>${ev.nombre}</h3>
      <p><b>Salida (S):</b> ${rec.concentracion.nombre}, desde las ${horaCompleta(ev.hora)}<br><b>Llegada (L):</b> ${rec.finalizacion.nombre}</p>
      <div class="acciones"><a class="btn btn--secundario" href="#/movilidad?dia=${ev.fecha}">${iconos.ruta}Movilidad</a><a class="btn" href="#/evento/${ev.id}">Ver detalle</a></div>`;
  } else if (sel.tipo === 'lugar') {
    const l = lugar(sel.id);
    const eventos = datos.eventos.filter((e) => e.lugar === l.id);
    html = l.lat
      ? `<span class="etiqueta etiqueta--azul">Eventos</span><h3>${l.nombre}</h3><p>${l.direccion}</p>
        <div class="lista-mini">${eventos.slice(0, 3).map((e) => `<a href="#/evento/${e.id}">${e.nombre}<small>${fechaLarga(e.fecha)} · ${horaCompleta(e.hora)}</small></a>`).join('')}${eventos.length > 3 ? `<small>y ${eventos.length - 3} eventos más en la agenda</small>` : ''}</div>
        <div class="acciones acciones--una">${comoLlegar(l.lat, l.lon)}</div>`
      : `<span class="etiqueta etiqueta--azul">Eventos</span><h3>${l.nombre}</h3><p>Este evento se realiza en varios sectores (${l.direccion}), así que no tiene un punto único en el mapa.</p>`;
  } else if (sel.tipo === 'punto') {
    const p = porId(datos.puntos, sel.id);
    const color = p.capa === 'salud' ? 'verde' : 'amarillo';
    html = `<span class="etiqueta etiqueta--${color}">${p.tipo}</span><h3>${p.nombre}</h3><p class="fuente">Ubicación: ${p.fuente}</p>
      <div class="acciones ${p.telefono ? '' : 'acciones--una'}">${p.telefono ? `<a class="btn" href="tel:${p.telefono}">${iconos.telefono}Llamar al ${p.telefono}</a>` : ''}${comoLlegar(p.lat, p.lon)}</div>`;
  } else if (sel.tipo === 'aviso') {
    html = `<p>${sel.texto}</p>`;
  }
  $t.innerHTML = `<div class="tarjeta-mapa">${cerrar}${html}</div>`;
}

function ubicarme() {
  const aviso = (texto) => { mapa.seleccion = { tipo: 'aviso', texto }; mostrarTarjeta(); };
  if (!navigator.geolocation) return aviso('Este navegador no permite conocer tu ubicación.');
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude: la, longitude: lo } = pos.coords;
    const [lo0, la0, lo1, la1] = mapa.base.bbox;
    if (la < la0 || la > la1 || lo < lo0 || lo > lo1) return aviso('Tu ubicación está fuera del área del mapa (centro de Pasto).');
    const [x, y] = crearProyeccion(mapa.base)(la, lo);
    document.getElementById('capa-yo').innerHTML = `<g transform="translate(${x} ${y})"><g class="marca-escala"><circle r="14" fill="#008EC4" opacity=".2"/><circle r="7" fill="#008EC4" stroke="#fff" stroke-width="3"/></g></g>`;
    mapa.gestos.encuadrar([x - 100, y - 100, x + 100, y + 100], 0);
  }, () => aviso('No se pudo obtener tu ubicación. Revisa el permiso del navegador.'), { timeout: 8000 });
}

// 04 Información práctica sin conexión (HU-08, HU-09, HU-13)
const fechaActualizacion = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
function pantallaInformacion() {
  const ip = datos.informacionPractica;
  const conectado = navigator.onLine;
  return `
    ${barraSuperior('#/', 'Información práctica')}
    <div class="aviso ${conectado ? 'aviso--exito' : ''}">${conectado ? iconos.check : iconos.sinConexion}
      <span>${conectado ? 'Esta información queda guardada en el celular y se puede consultar sin conexión.' : `Estás sin conexión. Se muestra la información guardada el ${fechaActualizacion(datos.actualizado)}.`}</span>
    </div>
    <section class="panel paquete">
      <div><b>Edición ${datos.edicion}</b><small>Versión ${datos.version} · actualizada el ${fechaActualizacion(datos.actualizado)}</small></div>
      <button class="btn btn--secundario" data-actualizar>${iconos.recargar}Buscar actualización</button>
      <div id="estado-actualizacion" aria-live="polite"></div>
    </section>
    <h2 class="titulo-seccion">Emergencias</h2>
    <a class="btn btn--bloque btn--emergencia" href="tel:123">${iconos.telefono}Llamar al 123</a>
    <ul class="lista-participantes lista-telefonos">
      ${ip.emergencias.map((e) => `<li><span>${e.nombre}</span><a href="tel:${e.numero}">${iconos.telefono}${e.numero}</a></li>`).join('')}
    </ul>
    <h2 class="titulo-seccion">Salud cerca de la Senda</h2>
    <div class="lista-enlaces">${datos.puntos.filter((p) => p.capa === 'salud').map((p) => `
      <a class="enlace-fila" href="#/mapa?punto=${p.id}">
        <span class="avatar avatar--verde">${iconos.salud}</span>
        <span><b>${p.nombre}</b><small>${p.tipo} · Ver en el mapa</small></span>${iconos.flecha}
      </a>`).join('')}</div>
    <h2 class="titulo-seccion">Normas del Carnaval</h2>
    <div class="lista-enlaces">${ip.normas.map((n) => `
      <div class="tarjeta-norma"><b>${n.titulo}</b><p>${n.texto}</p><small>${n.fuente}</small></div>`).join('')}</div>
    <h2 class="titulo-seccion">Recomendaciones</h2>
    <ul class="lista-recomendaciones">${ip.recomendaciones.map((r) => `<li>${r.texto}<small>${r.fuente}</small></li>`).join('')}</ul>
    <a class="enlace-fila informacion" href="#/movilidad">
      <span class="avatar avatar--verde">${iconos.ruta}</span>
      <span><b>Cómo moverse</b><small>Cierres y restricciones de cada día</small></span>${iconos.flecha}
    </a>`;
}

async function buscarActualizacion(boton) {
  const $estado = document.getElementById('estado-actualizacion');
  boton.disabled = true;
  try {
    if (!navigator.onLine) throw new Error('sin conexión');
    const nuevos = await (await fetch('data/edicion-2026.json', { cache: 'no-store' })).json();
    if (nuevos.version !== datos.version) {
      datos = nuevos;
      textoBusqueda.clear();
      $estado.innerHTML = `<div class="aviso aviso--exito">${iconos.check}<span>Se descargó la versión ${datos.version}.</span></div>`;
    } else {
      $estado.innerHTML = `<div class="aviso aviso--exito">${iconos.check}<span>Ya tienes la versión más reciente (${datos.version}).</span></div>`;
    }
  } catch {
    $estado.innerHTML = `<div class="aviso">${iconos.sinConexion}<span>Sin conexión. Sigues viendo la información guardada; busca la actualización cuando tengas señal.</span></div>`;
  }
  boton.disabled = false;
}

// 10 Cómo moverse (HU-14)
const movilidad = { dia: null };
function pantallaMovilidad(_, params) {
  if (params.get('dia')) movilidad.dia = params.get('dia');
  movilidad.dia ??= datos.dias[0].fecha;
  return `
    ${barraSuperior('#/informacion', 'Cómo moverse')}
    <p class="texto">Cierres por los desfiles y restricciones de tránsito de cada día del Carnaval.</p>
    <div class="fila-chips" id="dias-movilidad" role="group" aria-label="Día">
      ${datos.dias.map((d) => `<button class="chip-dia" data-dia-movilidad="${d.fecha}" aria-pressed="${d.fecha === movilidad.dia}"><small>${d.dia}</small><b>${d.etiqueta.split(' ')[0]}</b><small>${d.etiqueta.split(' ')[1]}</small></button>`).join('')}
    </div>
    <div id="movilidad-dia"></div>`;
}

function montarMovilidad() {
  const fecha = movilidad.dia;
  $pantalla.querySelectorAll('[data-dia-movilidad]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.diaMovilidad === fecha));
  const $dias = document.getElementById('dias-movilidad');
  const $activo = $dias.querySelector('[aria-pressed="true"]');
  $dias.scrollLeft = $activo.offsetLeft - ($dias.clientWidth - $activo.offsetWidth) / 2;

  const desfiles = datos.eventos.filter((e) => e.fecha === fecha && e.concentracion);
  const restricciones = datos.movilidad.restricciones.filter((r) => r.fechas.includes(fecha));
  const cierres = desfiles.map((ev) => {
    const rec = datos.recorridos.find((r) => r.evento === ev.id);
    return `
      <article class="tarjeta-cierre">
        <span class="etiqueta etiqueta--rojo">Vía cerrada · desde las ${horaCompleta(ev.hora)}</span>
        <h3>${ev.nombre}</h3>
        <p>${ev.concentracion === ev.finalizacion ? `Salida y llegada: ${ev.concentracion}` : `De ${ev.concentracion} a ${ev.finalizacion}`}</p>
        ${rec ? `<div class="calles">${rec.calles.map((c) => `<span>${c}</span>`).join('')}</div>
          <a class="btn btn--secundario btn--bloque" href="#/mapa?evento=${ev.id}">${iconos.mapa}Ver el recorrido en el mapa</a>` : ''}
      </article>`;
  }).join('');
  document.getElementById('movilidad-dia').innerHTML = `
    <h2 class="titulo-seccion">Vías cerradas</h2>
    ${cierres || '<p class="texto">La programación oficial no tiene desfiles por la Senda este día.</p>'}
    <h2 class="titulo-seccion">Restricciones de tránsito</h2>
    ${restricciones.length ? restricciones.map((r) => `<div class="tarjeta-norma"><p>${r.texto}</p><small>${r.fuente}</small></div>`).join('') : '<p class="texto">No hay restricciones especiales publicadas para este día.</p>'}
    <h2 class="titulo-seccion">Rutas habilitadas</h2>
    <div class="tarjeta-norma"><p>Usa vías que no formen parte del recorrido. Por los cierres, muévete con tiempo o en transporte público.</p><small>RCN Radio, 2026</small></div>
    <p class="nota">El cierre exacto de cada vía y los desvíos los define la Secretaría de Tránsito y Transporte de Pasto.</p>`;
}

// 05 Favoritos y recordatorio (HU-15, HU-16)
const favs = { vista: 'proximos', edicion: {}, destacado: null };
const ANTICIPACION = [15, 30, 60];
const textoAnticipacion = (m) => (m === 60 ? '1 hora' : `${m} min`);

// Las fechas se muestran sin año: cada evento se ubica en el Carnaval en curso o en el próximo
function fechaEnTemporada(ev) {
  const hoy = new Date();
  const inicio = hoy.getMonth() === 0 && hoy.getDate() <= 7 ? hoy.getFullYear() - 1 : hoy.getFullYear();
  const [, mes, dia] = ev.fecha.split('-').map(Number);
  const [hh, mm] = (ev.hora ?? '00:00').split(':').map(Number);
  return new Date(mes === 12 ? inicio : inicio + 1, mes - 1, dia, hh, mm);
}

function momentoAviso(ev, minutos) {
  // Se calcula con la fecha de la programación, para que el día de la semana coincida con la agenda
  const [a, m, d] = ev.fecha.split('-').map(Number);
  const [hh, mm] = (ev.hora ?? '00:00').split(':').map(Number);
  const t = new Date(a, m - 1, d, hh, mm - minutos);
  const dos = (n) => String(n).padStart(2, '0');
  const fecha = `${t.getFullYear()}-${dos(t.getMonth() + 1)}-${dos(t.getDate())}`;
  const dia = datos.dias.some((x) => x.fecha === fecha)
    ? fechaLarga(fecha).toLowerCase()
    : t.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
  return `el ${dia} a las ${horaCompleta(`${dos(t.getHours())}:${dos(t.getMinutes())}`)}`;
}

function pantallaFavoritos(_, params) {
  favs.destacado = params.get('evento');
  if (favs.destacado && favoritos.has(favs.destacado) && recordatorios[favs.destacado] == null) favs.edicion[favs.destacado] ??= 30;
  return `
    <header class="encabezado"><div><h1>Mis favoritos</h1><p class="sub" id="conteo-favoritos"></p></div></header>
    <div class="aviso">${iconos.sinConexion}<span>Los recordatorios quedan programados en el celular y llegan aunque no tengas conexión.</span></div>
    <div class="fila-chips vistas-favoritos" role="group" aria-label="Eventos guardados">
      <button class="chip" data-vista-favoritos="proximos"></button><button class="chip" data-vista-favoritos="pasados"></button>
    </div>
    <div id="lista-favoritos"></div>`;
}

function bloqueRecordatorio(ev) {
  if (fechaEnTemporada(ev) < new Date()) return '<p class="recordatorio-estado">Este evento ya pasó.</p>';
  const guardado = recordatorios[ev.id];
  const borrador = favs.edicion[ev.id];
  const activo = guardado != null || borrador != null;
  let cuerpo = '';
  if (borrador != null) {
    cuerpo = `
      <div class="fila-chips" role="group" aria-label="Avisarme antes">
        ${ANTICIPACION.map((m) => `<button class="chip" data-anticipacion="${ev.id}" data-minutos="${m}" aria-pressed="${m === borrador}">${textoAnticipacion(m)} antes</button>`).join('')}
      </div>
      <button class="btn btn--bloque" data-guardar-recordatorio="${ev.id}">${iconos.campana}Guardar recordatorio</button>`;
  } else if (guardado != null) {
    cuerpo = `
      <div class="aviso aviso--exito">${iconos.check}<span>Recordatorio guardado: te avisaremos ${momentoAviso(ev, guardado)} (${textoAnticipacion(guardado)} antes).</span></div>
      <div class="recordatorio-acciones">
        <button class="btn btn--texto" data-editar-recordatorio="${ev.id}">Cambiar anticipación</button>
        <button class="btn btn--texto" data-probar-aviso="${ev.id}">${iconos.campana}Probar aviso</button>
      </div>`;
  }
  return `
    <div class="recordatorio">
      <label class="interruptor">
        <span><b>Recordarme</b><small>${guardado != null ? `${textoAnticipacion(guardado)} antes` : activo ? 'Elige con cuánta anticipación' : 'Desactivado'}</small></span>
        <input type="checkbox" role="switch" data-recordatorio="${ev.id}" ${activo ? 'checked' : ''}>
      </label>
      ${cuerpo}
    </div>`;
}

function montarFavoritos() {
  const ahora = new Date();
  const lista = datos.eventos.filter((e) => favoritos.has(e.id)).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const pasados = lista.filter((e) => fechaEnTemporada(e) < ahora);
  const proximos = lista.filter((e) => !pasados.includes(e));
  if (favs.destacado && pasados.some((e) => e.id === favs.destacado)) favs.vista = 'pasados';
  const visibles = favs.vista === 'pasados' ? pasados : proximos;

  document.getElementById('conteo-favoritos').textContent = `${lista.length} ${lista.length === 1 ? 'evento guardado' : 'eventos guardados'}`;
  $pantalla.querySelectorAll('[data-vista-favoritos]').forEach((b) => {
    const n = b.dataset.vistaFavoritos === 'pasados' ? pasados.length : proximos.length;
    b.textContent = `${b.dataset.vistaFavoritos === 'pasados' ? 'Pasados' : 'Próximos'} (${n})`;
    b.setAttribute('aria-pressed', b.dataset.vistaFavoritos === favs.vista);
  });

  let html;
  if (!lista.length) {
    html = `<div class="vacio">${iconos.corazon}<p><b>Aún no tienes favoritos</b><br>Toca el corazón de un evento en la agenda para guardarlo aquí.</p><a class="btn btn--secundario" href="#/agenda">Ir a la agenda</a></div>`;
  } else if (!visibles.length) {
    html = `<div class="vacio">${iconos.corazon}<p>${favs.vista === 'pasados' ? 'Los eventos guardados que ya pasaron aparecen aquí.' : 'No tienes eventos próximos guardados.'}</p></div>`;
  } else {
    const fechas = [...new Set(visibles.map((e) => e.fecha))];
    html = fechas.map((f) => `<h2 class="titulo-dia">${fechaLarga(f)}</h2>${visibles.filter((e) => e.fecha === f).map((e) => `
      <div class="favorito" id="favorito-${e.id}">${tarjetaEvento(e)}${bloqueRecordatorio(e)}</div>`).join('')}`).join('');
  }
  document.getElementById('lista-favoritos').innerHTML = html;

  const $destacado = favs.destacado && document.getElementById(`favorito-${favs.destacado}`);
  if ($destacado) {
    $destacado.classList.add('favorito--destacado');
    $destacado.scrollIntoView({ block: 'center' });
  }
  favs.destacado = null;
}

// Aviso simulado: en la app nativa es una notificación local del sistema
let temporizadorAviso = null;
function mostrarAviso(ev, minutos) {
  let $n = document.getElementById('notificacion');
  if (!$n) {
    $n = document.createElement('a');
    $n.id = 'notificacion';
    $n.className = 'notificacion';
    $n.setAttribute('role', 'status');
    $n.addEventListener('click', () => $n.classList.remove('notificacion--visible'));
    document.querySelector('.telefono').append($n);
  }
  $n.href = `#/evento/${ev.id}`;
  $n.innerHTML = `
    <span class="notificacion-icono">${iconos.campana}</span>
    <span><small>Carnaval de Negros y Blancos · ahora</small><b>${ev.nombre}</b>Empieza en ${textoAnticipacion(minutos)} · ${lugar(ev.lugar).nombre}</span>`;
  requestAnimationFrame(() => $n.classList.add('notificacion--visible'));
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => $n.classList.remove('notificacion--visible'), 6000);
}

function noEncontrado() {
  return `<div class="vacio">${iconos.info}<p>No encontramos esta información.</p><a class="btn btn--secundario" href="#/agenda">Ir a la agenda</a></div>`;
}

function enConstruccion() {
  return `<div class="vacio">${iconos.info}<p>Esta sección se construye en los siguientes bloques.</p><a class="btn btn--secundario" href="#/">Volver al inicio</a></div>`;
}

// Navegación por rutas (#/agenda, #/evento/id, #/colectivo/id)
const rutas = {
  '': { pantalla: pantallaInicio },
  agenda: { pantalla: pantallaAgenda, montar: montarAgenda },
  evento: { pantalla: pantallaEvento, pestaña: '#/agenda' },
  colectivo: { pantalla: pantallaColectivo, pestaña: '#/agenda' },
  mapa: { pantalla: pantallaMapa, montar: montarMapa },
  favoritos: { pantalla: pantallaFavoritos, montar: montarFavoritos },
  informacion: { pantalla: pantallaInformacion, pestaña: '#/' },
  movilidad: { pantalla: pantallaMovilidad, montar: montarMovilidad, pestaña: '#/' }
};

const pila = [];
let rutaActual = null;

function render() {
  const [camino, consulta = ''] = (location.hash || '#/').slice(2).split('?');
  const [nombre, ...partes] = camino.split('/');
  const ruta = rutas[nombre];

  if (rutaActual === 'agenda') agenda.scroll = $pantalla.scrollTop;
  if (pila.at(-2) === location.hash) pila.pop(); else pila.push(location.hash);
  rutaActual = nombre;

  $pantalla.innerHTML = ruta ? ruta.pantalla(partes, new URLSearchParams(consulta)) : enConstruccion();
  $pantalla.scrollTop = 0;
  ruta?.montar?.();

  const pestaña = ruta?.pestaña ?? `#/${nombre}`;
  $nav.querySelectorAll('a').forEach((a) => {
    if (a.getAttribute('href') === pestaña) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

$pantalla.addEventListener('click', (e) => {
  const el = e.target.closest('[data-fav], [data-dia], [data-filtro], #limpiar, [data-recordar], [data-atras], [data-capa-mapa], [data-desfile], [data-zoom], [data-ubicacion], [data-cerrar-tarjeta], .marca, .ruta, [data-actualizar], [data-dia-movilidad], [data-vista-favoritos], [data-anticipacion], [data-guardar-recordatorio], [data-editar-recordatorio], [data-probar-aviso]');
  if (!el) return;

  if (el.dataset.fav) {
    const id = el.dataset.fav;
    if (favoritos.has(id)) {
      favoritos.delete(id);
      delete recordatorios[id];
      delete favs.edicion[id];
      guardarRecordatorios();
    } else favoritos.add(id);
    guardarFavoritos();
    $pantalla.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => b.setAttribute('aria-pressed', favoritos.has(id)));
    if (rutaActual === 'favoritos') montarFavoritos();
  } else if (el.dataset.vistaFavoritos) {
    favs.vista = el.dataset.vistaFavoritos;
    montarFavoritos();
  } else if (el.dataset.anticipacion) {
    favs.edicion[el.dataset.anticipacion] = Number(el.dataset.minutos);
    montarFavoritos();
  } else if (el.dataset.guardarRecordatorio) {
    const id = el.dataset.guardarRecordatorio;
    recordatorios[id] = favs.edicion[id];
    delete favs.edicion[id];
    guardarRecordatorios();
    montarFavoritos();
  } else if (el.dataset.editarRecordatorio) {
    favs.edicion[el.dataset.editarRecordatorio] = recordatorios[el.dataset.editarRecordatorio];
    montarFavoritos();
  } else if (el.dataset.probarAviso) {
    mostrarAviso(porId(datos.eventos, el.dataset.probarAviso), recordatorios[el.dataset.probarAviso]);
  } else if (el.dataset.dia) {
    agenda.dia = el.dataset.dia;
    agenda.texto = '';
    document.getElementById('buscar').value = '';
    actualizarAgenda();
  } else if (el.dataset.filtro) {
    agenda[el.dataset.filtro] = el.dataset.valor;
    actualizarAgenda();
  } else if (el.id === 'limpiar') {
    Object.assign(agenda, { texto: '', categoria: 'todas', lugar: 'todos' });
    document.getElementById('buscar').value = '';
    actualizarAgenda();
  } else if (el.dataset.recordar) {
    favoritos.add(el.dataset.recordar);
    guardarFavoritos();
    $pantalla.querySelectorAll(`[data-fav="${el.dataset.recordar}"]`).forEach((b) => b.setAttribute('aria-pressed', 'true'));
    document.getElementById('aviso-detalle').innerHTML = `<div class="aviso aviso--exito">${iconos.check}<span>Guardado en favoritos. Elige cuándo avisarte en <a href="#/favoritos?evento=${el.dataset.recordar}">Favoritos</a>.</span></div>`;
  } else if (el.dataset.capaMapa) {
    mapa.capas[el.dataset.capaMapa] = !mapa.capas[el.dataset.capaMapa];
    el.setAttribute('aria-pressed', mapa.capas[el.dataset.capaMapa]);
    dibujarMapa();
  } else if (el.dataset.desfile) {
    const igual = mapa.desfile === el.dataset.desfile;
    mapa.desfile = igual ? null : el.dataset.desfile;
    mapa.capas.desfile = true;
    $pantalla.querySelector('[data-capa-mapa="desfile"]').setAttribute('aria-pressed', 'true');
    $pantalla.querySelectorAll('[data-desfile]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.desfile === mapa.desfile));
    mapa.seleccion = mapa.desfile ? { tipo: 'recorrido', id: mapa.desfile } : null;
    dibujarMapa();
    mostrarTarjeta();
    if (mapa.desfile) mapa.gestos.encuadrar(cajaDe(datos.recorridos.find((r) => r.evento === mapa.desfile).trazado));
  } else if (el.dataset.zoom) {
    mapa.gestos?.zoom(Number(el.dataset.zoom));
  } else if (el.hasAttribute('data-ubicacion')) {
    ubicarme();
  } else if (el.hasAttribute('data-cerrar-tarjeta')) {
    mapa.seleccion = null;
    mostrarTarjeta();
    dibujarMapa();
  } else if (el.classList.contains('marca') || el.classList.contains('ruta')) {
    if (mapa.gestos?.fueArrastre()) return;
    if (el.classList.contains('ruta')) {
      if (!el.dataset.recorrido) return;
      mapa.seleccion = { tipo: 'recorrido', id: el.dataset.recorrido };
    } else {
      const [tipo, id] = el.dataset.punto.split(':');
      mapa.seleccion = { tipo: tipo === 'lugar' ? 'lugar' : 'punto', id };
    }
    dibujarMapa();
    mostrarTarjeta();
  } else if (el.hasAttribute('data-actualizar')) {
    buscarActualizacion(el);
  } else if (el.dataset.diaMovilidad) {
    movilidad.dia = el.dataset.diaMovilidad;
    montarMovilidad();
  } else if (el.hasAttribute('data-atras') && pila.length > 1) {
    e.preventDefault();
    history.back();
  }
});

$pantalla.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.classList.contains('marca')) e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});

$pantalla.addEventListener('change', (e) => {
  const id = e.target.dataset.recordatorio;
  if (!id) return;
  if (e.target.checked) favs.edicion[id] = 30;
  else {
    delete favs.edicion[id];
    delete recordatorios[id];
    guardarRecordatorios();
  }
  montarFavoritos();
});

$pantalla.addEventListener('input', (e) => {
  if (e.target.id !== 'buscar') return;
  agenda.texto = e.target.value;
  actualizarAgenda();
});

async function iniciar() {
  $nav.innerHTML = pestañas.map((p) => `<a href="${p.ruta}">${iconos[p.icono]}${p.nombre}</a>`).join('');
  const respuesta = await fetch('data/edicion-2026.json');
  datos = await respuesta.json();
  window.addEventListener('hashchange', render);
  ['online', 'offline'].forEach((ev) => window.addEventListener(ev, () => { if (rutaActual === 'informacion') render(); }));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
  render();
}

iniciar();
