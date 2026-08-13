# Sitio web — Vanesa Brombin | Publicidad Digital

Sitio real, estático (HTML/CSS/JS sin build step), listo para subir a Hostinger u otro hosting por FTP.

## Páginas

- `index.html` — Home
- `ecommerce.html` — Camino Ecommerce (ESCALA / FUERZA / SISTEMA)
- `infoproductos.html` — Servicios, profesionales e infoproductos
- `claridad.html` — Asesoría estratégica CLARIDAD
- `contacto.html` — Contacto

## Estructura

- `styles.css` — sistema de diseño (un solo archivo)
- `main.js` — efectos (gradiente que reacciona al mouse en el hero, reveals al hacer scroll, contadores animados, tilt en tarjetas, marquee de marcas)
- `lib/` — GSAP y ScrollTrigger (librerías locales, sin CDN)
- `assets/img/` — logo, foto y capturas de testimonios
- `tools/serve.ps1` — script opcional para previsualizar el sitio en local (`http://localhost:8080`)
- `.htaccess` — configuración de caché para Hostinger/Apache

## Paleta de marca

Verde `#085e55`, magenta `#d70582` (confirmados en el manual de marca oficial).

## Deploy

1. Subí todos los archivos (excepto `tools/`, que es solo para desarrollo) a la raíz de tu hosting por FTP o el administrador de archivos de Hostinger.
2. Cada vez que cambies `styles.css` o `main.js`, actualizá el número `?v=YYYYMMDD` en los `<link>` y `<script>` de cada página HTML, para evitar que el navegador muestre una versión vieja en caché.
