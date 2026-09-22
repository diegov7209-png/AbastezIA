const PageDashboard = (() => {
  async function render(el) {
    const data = await Api.call('getDashboard');
    el.innerHTML = `
      <div class="page-header"><h1>Inicio</h1></div>
      <div class="stat-grid">
        ${statCard('Proveedores activos', data.totalProveedores)}
        ${statCard('Productos', data.totalProductos)}
        ${statCard('Clientes', data.totalClientes)}
        ${statCard('Pedidos pendientes', data.pedidosPendientes)}
        ${statCard('Cotizaciones', data.cotizacionesPendientes)}
      </div>
      <a href="#/chat" class="btn-ask-ai">💬 Pregúntale a la IA</a>
      <h2 class="section-title">Actividad reciente</h2>
      <ul class="activity-list">
        ${data.actividadReciente.map((a) => `
          <li>
            <span class="activity-modulo">${a.modulo}</span>
            <span class="activity-desc">${a.usuario} — ${a.accion}</span>
            <span class="activity-fecha">${formatFecha(a.fecha)}</span>
          </li>`).join('') || '<li class="empty">Sin actividad todavía.</li>'}
      </ul>`;
  }

  function statCard(label, value) {
    return `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
  }

  function formatFecha(f) {
    const d = new Date(f);
    return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }

  return { render };
})();
