// admin-common.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

let eventoId = null;
const urlParams = new URLSearchParams(window.location.search);
const idParam = urlParams.get('id');
if (idParam) eventoId = parseInt(idParam);

async function fetchAPI(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (res.status === 401) { localStorage.clear(); window.location.href = 'login.html'; }
    return res.json();
}

function mostrarMensaje(texto, tipo, contenedorId = 'globalMessage') {
    const div = document.getElementById(contenedorId);
    if (!div) {
        console.warn(`Contenedor de mensajes "${contenedorId}" no encontrado.`);
        // Fallback simple por si es crítico
        if (tipo === 'error') alert(texto);
        return;
    }
    div.className = `message message-${tipo}`;
    div.innerText = texto;
    div.style.display = 'block';
    setTimeout(() => { div.style.display = 'none'; }, 4000);
}

async function uploadImage(fileInput, targetInputId) {
    const file = fileInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById(targetInputId).value = data.url;
            mostrarMensaje('Imagen subida correctamente', 'success');
        } else {
            mostrarMensaje('Error al subir imagen', 'error');
        }
    } catch (err) {
        console.error(err);
        mostrarMensaje('Error de conexión', 'error');
    }
}

function configurarUploads() {
    const uploadButtons = document.querySelectorAll('.btn-upload');
    uploadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (e) => uploadImage(e.target, targetId);
            fileInput.click();
        });
    });
}
async function uploadImageToLista(fileInput, listaId) {
    const file = fileInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            agregarFilaImagen(listaId, data.url);
            mostrarMensaje('Imagen subida correctamente', 'success');
        } else {
            mostrarMensaje('Error al subir imagen', 'error');
        }
    } catch (err) {
        console.error(err);
        mostrarMensaje('Error de conexión', 'error');
    }
}

function configurarUploadsMulti() {
    document.querySelectorAll('.btn-upload-multi').forEach(btn => {
        btn.addEventListener('click', () => {
            const listaId = btn.dataset.lista;
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (e) => uploadImageToLista(e.target, listaId);
            fileInput.click();
        });
    });
}