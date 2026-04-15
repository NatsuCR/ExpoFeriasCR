/**
 * uploadManager.js
 * Gestiona la carga de imágenes al servidor
 */

export async function subirImagen(file, feedbackId, btnEl) {
  const feedback = feedbackId ? document.getElementById(feedbackId) : null;
  if (feedback) { feedback.className = 'upload-feedback'; feedback.style.display = 'none'; }

  const token = localStorage.getItem('token');
  if (!token) { alert('Sesión expirada. Inicia sesión nuevamente.'); return null; }

  const originalHtml = btnEl ? btnEl.innerHTML : '';
  if (btnEl) { btnEl.innerHTML = '<span class="uploading-spinner"></span>'; btnEl.disabled = true; }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success && data.url) {
      if (feedback) { feedback.className = 'upload-feedback ok'; feedback.textContent = '✓ Imagen subida correctamente'; }
      return data.url;
    }
    throw new Error(data.error || 'Error al subir imagen');
  } catch (err) {
    if (feedback) { feedback.className = 'upload-feedback err'; feedback.textContent = '✗ ' + err.message; }
    return null;
  } finally {
    if (btnEl) { btnEl.innerHTML = originalHtml; btnEl.disabled = false; }
  }
}

export function bindUpload(btnId, fileId, targetInputId, feedbackId, onSuccess) {
  const btn  = document.getElementById(btnId);
  const file = document.getElementById(fileId);
  if (!btn || !file) return;
  btn.addEventListener('click', () => file.click());
  file.addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const url = await subirImagen(f, feedbackId, btn);
    if (url) {
      if (targetInputId) document.getElementById(targetInputId).value = url;
      if (onSuccess) onSuccess(url);
    }
    file.value = '';
  });
}
