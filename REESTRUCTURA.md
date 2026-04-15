# Reestructura del proyecto

- `models/` se dejó intacta.
- Se separó el CSS embebido de `modal-auth.html` a `frontend/css/modal-auth.css`.
- Se separó el JS embebido de `frontend/admin/login.html` a `frontend/admin/js/login.js`.
- Los CSS grandes se dividieron en carpetas de partes y sus archivos principales quedaron como wrappers con `@import`.
- Se creó una estructura más clara por capas: `backend/controllers/{admin,usuario,publico}` y `frontend/js/{publico,admin,mi-cuenta,crear-evento,evento}`.
