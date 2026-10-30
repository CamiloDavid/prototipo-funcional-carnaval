import { iconos, marcador } from './icons.js';

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

const colorCategoria = (id) => datos.categorias.find((c) => c.id === id)?.color ?? 'gris';
const nombreLugar = (id) => datos.lugares.find((l) => l.id === id)?.nombre ?? '';
const horaTexto = (h) => {
  if (!h) return { hora: '—', sufijo: 'por confirmar' };
  const [hh, mm] = h.split(':').map(Number);
  return { hora: `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`, sufijo: hh < 12 ? 'a. m.' : 'p. m.' };
};

function tarjetaEvento(ev) {
  const cat = datos.categorias.find((c) => c.id === ev.categoria);
  const h = horaTexto(ev.hora);
  return `
    <article class="tarjeta-evento">
      <div class="hora">${h.hora}<small>${h.sufijo}</small></div>
      <div>
        <span class="etiqueta etiqueta--${colorCategoria(ev.categoria)}">${cat.nombre}</span>
        <h3>${ev.nombre}</h3>
        <p class="lugar">${iconos.lugar}${nombreLugar(ev.lugar)}</p>
      </div>
      <button class="fav" aria-pressed="false" aria-label="Guardar en favoritos">${iconos.corazon}</button>
    </article>`;
}

// Pantalla temporal del Bloque 0: base visual y verificación de datos
function pantallaBase() {
  const dia = datos.dias.find((d) => d.fecha === '2026-01-06');
  const eventosDia = datos.eventos.filter((e) => e.fecha === dia.fecha);
  return `
    <header class="encabezado">
      <div>
        <h1>Carnaval de Negros y Blancos</h1>
        <p class="sub">Base visual del prototipo · edición ${datos.edicion}</p>
      </div>
    </header>

    <section class="panel">
      <div class="datos">
        <div><b>${datos.eventos.length}</b><span>eventos</span></div>
        <div><b>${datos.dias.length}</b><span>días</span></div>
        <div><b>${datos.colectivos.length}</b><span>carrozas y colectivos</span></div>
      </div>
    </section>

    <h2 class="titulo-seccion">Colores</h2>
    <div class="muestras">
      <div style="background:var(--rojo)"></div><div style="background:var(--amarillo)"></div>
      <div style="background:var(--azul)"></div><div style="background:var(--verde)"></div>
      <div style="background:var(--fondo)"></div>
    </div>

    <h2 class="titulo-seccion">Buscador y filtros</h2>
    <label class="buscador">${iconos.buscar}<span class="oculto-visual">Buscar</span>
      <input type="search" placeholder="Busca un evento, colectivo o lugar">
    </label>
    <div class="fila-chips" style="margin-top:12px">
      ${datos.dias.slice(4, 10).map((d) => `<button class="chip-dia" aria-pressed="${d === dia}"><small>${d.dia}</small><b>${d.etiqueta.split(' ')[0]}</b><small>${d.etiqueta.split(' ')[1]}</small></button>`).join('')}
    </div>
    <div class="fila-chips">
      <button class="chip" aria-pressed="true">Todas</button>
      ${datos.categorias.map((c) => `<button class="chip" aria-pressed="false">${c.nombre}</button>`).join('')}
    </div>

    <h2 class="titulo-seccion">Tarjetas de evento · ${dia.etiqueta}</h2>
    ${eventosDia.map(tarjetaEvento).join('')}

    <h2 class="titulo-seccion">Botones e interruptor</h2>
    <div style="display:grid;gap:12px">
      <button class="btn btn--bloque">${iconos.campana}Recordarme</button>
      <button class="btn btn--secundario btn--bloque">${iconos.mapa}Ver en mapa</button>
      <label class="interruptor panel"><span>Recordatorio</span><input type="checkbox" checked></label>
    </div>

    <h2 class="titulo-seccion">Marcadores del mapa</h2>
    <div class="panel" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
      ${marcador('#D7263D')}${marcador('#008EC4')}${marcador('#2EAD68')}${marcador('#F7B801')}
      <div class="leyenda">
        <span><i style="background:var(--rojo)"></i>Desfile</span>
        <span><i style="background:var(--azul)"></i>Eventos</span>
        <span><i style="background:var(--verde)"></i>Salud</span>
        <span><i style="background:var(--amarillo)"></i>Servicios</span>
      </div>
    </div>

    <h2 class="titulo-seccion">Avisos</h2>
    <div style="display:grid;gap:12px">
      <div class="aviso">${iconos.sinConexion}<span>Estás sin conexión. Información guardada el ${new Date(datos.actualizado).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.</span></div>
      <div class="aviso aviso--exito">${iconos.check}<span>Recordatorio guardado.</span></div>
    </div>`;
}

function enConstruccion() {
  return `<div class="vacio">${iconos.info}<p>Esta sección se construye en los siguientes bloques.</p><a class="btn btn--secundario" href="#/">Volver al inicio</a></div>`;
}

const rutas = { '#/': pantallaBase };

function render() {
  const ruta = location.hash || '#/';
  $pantalla.innerHTML = (rutas[ruta] || enConstruccion)();
  $pantalla.scrollTop = 0;
  $nav.querySelectorAll('a').forEach((a) => {
    if (a.getAttribute('href') === ruta) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

// Interacciones de muestra (chips, favorito)
$pantalla.addEventListener('click', (e) => {
  const boton = e.target.closest('.chip, .chip-dia, .fav');
  if (!boton) return;
  if (boton.classList.contains('fav')) {
    boton.setAttribute('aria-pressed', boton.getAttribute('aria-pressed') !== 'true');
    return;
  }
  boton.parentElement.querySelectorAll('[aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', b === boton));
});

async function iniciar() {
  $nav.innerHTML = pestañas.map((p) => `<a href="${p.ruta}">${iconos[p.icono]}${p.nombre}</a>`).join('');
  const respuesta = await fetch('data/edicion-2026.json');
  datos = await respuesta.json();
  window.addEventListener('hashchange', render);
  render();
}

iniciar();
