/**
 * mi-cuenta/profile.js - Gestión de perfil y autenticación
 */

MiCuenta.prototype.sincronizarPerfil = async function() {
  try {
    const response = await this.apiFetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    if (response.ok) {
      const data = await response.json();
      this.usuario = data.user;
      localStorage.setItem('usuario', JSON.stringify(data.user));
    }
  } catch (error) {
    console.warn('Error al sincronizar perfil:', error);
  }
};

MiCuenta.prototype.cargarPerfil = function() {
  document.getElementById('perfil-nombre').textContent = this.usuario.nombre;
  document.getElementById('perfil-email').textContent = this.usuario.email;

  if (this.usuario.rol === 'admin') {
    const perfilAcciones = document.querySelector('.perfil-acciones');
    if (perfilAcciones) {
      // Evitar duplicados
      if (!document.getElementById('btn-ir-admin')) {
        const btnAdmin = document.createElement('a');
        btnAdmin.id = 'btn-ir-admin';
        btnAdmin.href = '/admin/dashboard.html';
        btnAdmin.className = 'btn-primary';
        btnAdmin.style.marginBottom = '10px';
        btnAdmin.style.textDecoration = 'none';
        btnAdmin.style.display = 'flex';
        btnAdmin.style.alignItems = 'center';
        btnAdmin.style.gap = '8px';
        btnAdmin.style.justifyContent = 'center';
        btnAdmin.style.backgroundColor = '#C8102E';
        btnAdmin.innerHTML = '<i class="fas fa-user-shield"></i> Ir a Panel Admin';
        perfilAcciones.prepend(btnAdmin);
      }
    }
  }
};

MiCuenta.prototype.abrirModalPassword = function() {
  document.getElementById('modal-cambiar-password').style.display = 'flex';
};

MiCuenta.prototype.cerrarModalPassword = function() {
  document.getElementById('modal-cambiar-password').style.display = 'none';
  document.getElementById('form-cambiar-password').reset();
  document.getElementById('mensaje-password').style.display = 'none';
};

MiCuenta.prototype.handleCambiarPassword = async function(e) {
  e.preventDefault();

  const nueva = document.getElementById('nueva-password').value;
  const confirmar = document.getElementById('confirmar-password').value;
  const mensajeDiv = document.getElementById('mensaje-password');

  if (nueva !== confirmar) {
    this.mostrarMensajePassword('Las contraseñas no coinciden', 'error', mensajeDiv);
    return;
  }

  if (nueva.length < 6) {
    this.mostrarMensajePassword('La contraseña debe tener al menos 6 caracteres', 'error', mensajeDiv);
    return;
  }

  this.mostrarMensajePassword('Usa "Olvidé contraseña" en el login para cambiarla', 'info', mensajeDiv);
};

MiCuenta.prototype.handleEliminarCuenta = async function() {
  const confirmado = await window.confirmarAccion('¿CERRAR CUENTA?', 'ADVERTENCIA FINAL: Esta acción eliminará permanentemente tu cuenta y todos tus eventos registrados. Esta operación NO se puede deshacer. ¿Deseas continuar?');
  if (!confirmado) return;

  try {
    const response = await this.apiFetch('/api/auth/eliminar-cuenta', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert('Tu cuenta ha sido eliminada. Lamentamos verte partir.');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/index.html';
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar la cuenta');
    }
  } catch (error) {
    alert('Error: ' + error.message);
    console.error('Error al eliminar cuenta:', error);
  }
};

MiCuenta.prototype.mostrarMensajePassword = function(mensaje, tipo, div) {
  div.textContent = mensaje;
  div.className = `modal-mensaje ${tipo}`;
  div.style.display = 'block';
};



