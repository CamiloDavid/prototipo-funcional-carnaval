import { iconos, ilustracion } from './icons.js';

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
    <a class="enlace-fila informacion" href="#/informacion">
      <span class="avatar avatar--azul">${iconos.info}</span>
      <span><b>Información práctica</b><small>Emergencias, salud y recomendaciones</small></span>${iconos.flecha}
    </a>`;
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
      <a class="btn btn--secundario" href="#/mapa?lugar=${ev.lugar}">${iconos.mapa}Ver en mapa</a>
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
  colectivo: { pantalla: pantallaColectivo, pestaña: '#/agenda' }
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
  const el = e.target.closest('[data-fav], [data-dia], [data-filtro], #limpiar, [data-recordar], [data-atras]');
  if (!el) return;

  if (el.dataset.fav) {
    const id = el.dataset.fav;
    if (favoritos.has(id)) favoritos.delete(id); else favoritos.add(id);
    guardarFavoritos();
    $pantalla.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => b.setAttribute('aria-pressed', favoritos.has(id)));
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
    document.getElementById('aviso-detalle').innerHTML = `<div class="aviso aviso--exito">${iconos.check}<span>Guardado en favoritos. Elige cuándo avisarte en <a href="#/favoritos">Favoritos</a>.</span></div>`;
  } else if (el.hasAttribute('data-atras') && pila.length > 1) {
    e.preventDefault();
    history.back();
  }
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
  render();
}

iniciar();
