/**
 * seoService.js
 * Genera metadatos y datos estructurados (JSON-LD) para eventos.
 */

class SEOService {
  /**
   * Genera el bloque JSON-LD para un evento incluyendo BreadcrumbList
   * @param {Object} evento - Objeto de evento desde la DB
   * @returns {string} - Tag de script con JSON-LD
   */
  generarEventJSONLD(evento) {
    if (!evento) return '';

    const baseUrl = 'https://expoferiascr.site';
    let imagenUrl = evento.imagenPortada || evento.imagen_portada || evento.imagenFallback || '/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png';
    if (imagenUrl.startsWith('/')) {
      imagenUrl = `${baseUrl}${imagenUrl}`;
    }

    const eventSchema = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": evento.nombre,
      "description": evento.descripcion,
      "startDate": evento.fechaInicio || evento.fecha_inicio,
      "endDate": evento.fechaFin || evento.fecha_fin,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": evento.ubicacion,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": evento.provincia,
          "addressRegion": evento.provincia,
          "addressCountry": "CR"
        }
      },
      "image": [imagenUrl],
      "organizer": {
        "@type": "Organization",
        "name": "ExpoFeriasCR",
        "url": baseUrl,
        "logo": `${baseUrl}/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png`
      }
    };

    // Agregar oferta si hay información de venta online o es gratis
    const tipoVenta = evento.tipo_venta || evento.tipoVenta;
    if (evento.url_venta_online || evento.urlVentaOnline || tipoVenta === 'gratis') {
      eventSchema.offers = {
        "@type": "Offer",
        "url": evento.url_venta_online || evento.urlVentaOnline || `${baseUrl}/evento.html?slug=${evento.slug}`,
        "price": tipoVenta === 'gratis' ? "0" : undefined,
        "priceCurrency": "CRC",
        "availability": "https://schema.org/InStock",
        "validFrom": evento.fechaInicio || evento.fecha_inicio
      };
    }

    // BreadcrumbList para mejorar la navegación en Google
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": evento.nombre,
          "item": `${baseUrl}/evento.html?slug=${evento.slug}`
        }
      ]
    };

    return `
      <script type="application/ld+json">${JSON.stringify(eventSchema)}</script>
      <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;
  }

  /**
   * Inyecta los datos de un evento en el HTML (sustituyendo placeholders)
   * @param {string} html - Contenido del archivo HTML
   * @param {Object} evento - Objeto de evento
   * @returns {string} - HTML con metadatos inyectados
   */
  inyectarMetadatos(html, evento) {
    if (!evento) {
      const defaultTitle = 'Detalle de Evento | ExpoFeriasCR';
      const defaultDesc = 'Consulta toda la información sobre este evento en ExpoFeriasCR.';
      const defaultImg = 'https://expoferiascr.site/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png';

      return html
        .replace(/{{EVENT_NAME}}/g, 'Detalle de Evento')
        .replace(/{{EVENT_DESC}}/g, defaultDesc)
        .replace(/{{EVENT_IMAGE}}/g, defaultImg)
        .replace(/{{EVENT_SLUG}}/g, '')
        .replace('{{{EVENT_JSON_LD}}}', '');
    }

    const descBreve = evento.descripcion.length > 155
      ? evento.descripcion.substring(0, 152).trim() + '...'
      : evento.descripcion;

    let imagenUrl = evento.imagenPortada || evento.imagen_portada || evento.imagenFallback || '/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png';
    // Asegurar URL absoluta para redes sociales
    if (imagenUrl.startsWith('/')) {
      imagenUrl = `https://expoferiascr.site${imagenUrl}`;
    }

    // Generar keywords dinámicas más ricas
    const keywords = `ferias costa rica, fiestas civicas costa rica, eventos costa rica, ${evento.nombre}, ${evento.provincia}, ${evento.ubicacion}, actividades ${evento.provincia}, expo feria ${evento.nombre}`;

    return html
      .replace(/{{EVENT_NAME}}/g, evento.nombre)
      .replace(/{{EVENT_DESC}}/g, descBreve)
      .replace(/{{EVENT_IMAGE}}/g, imagenUrl)
      .replace(/{{EVENT_SLUG}}/g, evento.slug)
      .replace(/ferias, costa rica, fiestas cívicas, fiestas regionales, {{EVENT_NAME}}/g, keywords)
      .replace('{{{EVENT_JSON_LD}}}', this.generarEventJSONLD(evento));
  }

  /**
   * Genera el XML completo del Sitemap
   * @param {Array} slugs - Lista de slugs de eventos activos
   * @returns {string} - XML formateado
   */
  generarSitemapXML(slugs) {
    const baseUrl = 'https://expoferiascr.site';
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Página principal
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Eventos individuales
    slugs.forEach(slug => {
      xml += `  <url>\n    <loc>${baseUrl}/evento.html?slug=${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }
}

module.exports = new SEOService();




