const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM('<div id="actividades-rows"><tr><td style="display:none;"><span class="act-gratis" data-value="true"></span></td><td style="display:none;"><span class="act-requiere-online" data-value="false"></span></td><td style="display:none;"><span class="act-solo-online" data-value="false"></span></td><td style="display:none;"><span class="act-en-vivo" data-value="true"></span></td></tr></div>');
const document = dom.window.document;

function recolectarTabla(selector, mapaAtributos) {
  const filas = document.querySelectorAll(selector);
  const data = [];
  filas.forEach(row => {
    const obj = {};
    Object.entries(mapaAtributos).forEach(([key, sel]) => {
      const el = row.querySelector(sel);
      if (!el) return;
      
      if (key === 'es_gratis' || key === 'requiere_entrada_online' || key === 'solo_online' || key === 'en_vivo') {
        const val = el.getAttribute('data-value');
        console.log('val for', key, 'is', val, 'type', typeof val);
        obj[key] = (val === 'true' || val === '1' || val === true || val === 1) ? 1 : 0;
      }
    });
    data.push(obj);
  });
  return data;
}

const res = recolectarTabla('#actividades-rows tr', { es_gratis: '.act-gratis', requiere_entrada_online: '.act-requiere-online', solo_online: '.act-solo-online', en_vivo: '.act-en-vivo' });
console.log(res);
