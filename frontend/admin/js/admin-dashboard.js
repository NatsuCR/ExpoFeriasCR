/**
 * admin-dashboard.js - Gestión del dashboard admin
 */

class AdminDashboard {
  constructor() {
    this.init();
  }

  init() {
    this.verificarAutenticacion();
    this.setupEventListeners();
    this.actualizarContadorPendientes();
  }

  verificarAutenticacion() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario || usuario.rol !== 'admin') {
      alert('Acceso denegado. Se requieren permisos de administrador');
      window.location.href = '/index.html';
    }
  }

  setupEventListeners() {
    document.getElementById('btnLogout').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/index.html';
    });

    document.getElementById('btnCrearEvento').addEventListener('click', () => {
      window.location.href = 'evento-form.html';
    });
  }

  async actualizarContadorPendientes() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/eventos-pendientes-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const badge = document.getElementById('badge-pendientes-header');
        if (data.pendiente > 0) {
          badge.textContent = data.pendiente;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error al cargar contador de pendientes:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AdminDashboard();
});



