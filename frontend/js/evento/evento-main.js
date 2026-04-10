// evento-main.js (punto de entrada para evento.html)
import { cargarEvento } from './cargarEvento.js';
import { cargarActividades } from './cargarActividades.js';
import { cargarPrecios } from './cargarPrecios.js';
import { cargarExpositores } from './cargarExpositores.js';
import { cargarCarruselFondo } from './carruselFondo.js';

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');
if (!slug) window.location.href = '/';

document.addEventListener('DOMContentLoaded', () => {
    cargarEvento(slug);
    cargarActividades(slug);
    cargarPrecios(slug);
    cargarExpositores(slug);
    cargarCarruselFondo(slug);
});