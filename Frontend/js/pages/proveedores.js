const PageProveedores = (() => {
  let cacheProveedores = [];

  async function render(el) {
    el.innerHTML = `
      <div class="page-header">
        <h1>Proveedores</h1>
        <button id="btn-nuevo-proveedor" class="btn-primary btn-small">+ Nuevo</button>
      </div>
      <input type="search" id="buscador" class="input-search" placeholder="Buscar proveedor…">
      <div id="lista-proveedores" class="card-list"><div class="loading">Cargando…</div></div>
      <div id="modal-root"></div>`;

    document.getElementById('btn-nuevo-proveedor').addEventListener('click', () => abrirFormulario(null));
    document.getElementById('buscador').addEventListener('input', (e) => renderLista(filtrar(e.target.value)));

    cacheProveedores = await Api.call('listProveedores');
    renderLista(cacheProveedores);
  }

  function filtrar(texto) {
    const t = texto.toLowerCase();
    return cacheProveedores.filter((p) => (p.nombre_comercial || '').toLowerCase().includes(t));
  }

  function renderLista(lista) {
    const cont = document.getElementById('lista-proveedores');
    if (lista.length === 0) {
      cont.innerHTML = '<p class="empty">No hay proveedores todavía. Agrega el primero.</p>';
      return;
    }
    cont.innerHTML = lista.map((p) => `
      <button class="card-item" data-id="${p.id}">
        <div class="card-item-title">${p.nombre_comercial}</div>
        <div class="card-item-sub">${p.categoria || 'Sin categoría'} · ${p.ciudad || ''}</div>
        <div class="card-item-badge ${p.estatus === 'activo' ? 'badge-ok' : 'badge-off'}">${p.estatus || ''}</div>
      </button>`).join('');

    cont.querySelectorAll('.card-item').forEach((btn) => {
      btn.addEventListener('click', () => abrirDetalle(btn.dataset.id));
    });
  }

  async function abrirDetalle(id) {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = '<div class="modal-backdrop"><div class="modal loading">Cargando…</div></div>';
    const detalle = await Api.call('getProveedor', { id });
    const p = detalle.proveedor;
    const c = detalle.condiciones || {};

    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <button class="modal-close" id="modal-close">✕</button>
          <h2>${p.nombre_comercial}</h2>
          <p class="modal-sub">${p.categoria || ''} · ${p.ciudad || ''}, ${p.estado || ''}</p>
          <div class="detail-grid">
            <div><strong>Teléfono</strong><span>${p.telefono || '—'}</span></div>
            <div><strong>WhatsApp</strong><span>${p.whatsapp || '—'}</span></div>
            <div><strong>Email</strong><span>${p.email || '—'}</span></div>
            <div><strong>Crédito</strong><span>${c.credito_disponible ? (c.dias_credito ? c.dias_credito + ' días' : 'Sí, días no especificados') : 'No'}</span></div>
            <div><strong>Consignación</strong><span>${c.consignacion ? 'Sí' : 'No'}</span></div>
            <div><strong>Pedido mínimo</strong><span>${c.pedido_minimo || '—'}</span></div>
            <div><strong>Entrega estimada</strong><span>${c.tiempo_entrega_estimado || '—'}</span></div>
            <div><strong>Zonas de entrega</strong><span>${c.zonas_entrega || '—'}</span></div>
          </div>
          <h3>Productos (${detalle.productos.length})</h3>
          <ul class="simple-list">
            ${detalle.productos.map((prod) => `<li>${prod.nombre} — $${prod.precio_con_este_proveedor}</li>`).join('') || '<li class="empty">Sin productos registrados</li>'}
          </ul>
          <button class="btn-secondary" id="btn-editar">Editar</button>
        </div>
      </div>`;

    document.getElementById('modal-close').addEventListener('click', cerrarModal);
    document.getElementById('btn-editar').addEventListener('click', () => abrirFormulario(p));
  }

  function abrirFormulario(proveedorExistente) {
    const modal = document.getElementById('modal-root');
    const p = proveedorExistente || {};
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <button class="modal-close" id="modal-close">✕</button>
          <h2>${proveedorExistente ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
          <form id="form-proveedor" class="form-stack">
            <label>Nombre comercial <input name="nombre_comercial" value="${p.nombre_comercial || ''}" required></label>
            <label>Categoría <input name="categoria" value="${p.categoria || ''}"></label>
            <label>Ciudad <input name="ciudad" value="${p.ciudad || ''}"></label>
            <label>Teléfono <input name="telefono" value="${p.telefono || ''}"></label>
            <label>WhatsApp <input name="whatsapp" value="${p.whatsapp || ''}"></label>
            <label>Email <input name="email" type="email" value="${p.email || ''}"></label>
            <div id="form-error" class="error-box" hidden></div>
            <button type="submit" class="btn-primary">Guardar</button>
          </form>
        </div>
      </div>`;

    document.getElementById('modal-close').addEventListener('click', cerrarModal);
    document.getElementById('form-proveedor').addEventListener('submit', async (e) => {
      e.preventDefault();
      const datos = Object.fromEntries(new FormData(e.target).entries());
      const errorBox = document.getElementById('form-error');
      try {
        if (proveedorExistente) {
          await Api.call('updateProveedor', { id: p.id, cambios: datos });
        } else {
          const duplicados = await Api.call('checkPosibleDuplicadoProveedor', { nombre: datos.nombre_comercial });
          if (duplicados.length > 0 && !confirm(`Ya existe algo parecido: "${duplicados[0].nombre_comercial}". ¿Crear de todos modos?`)) {
            return;
          }
          await Api.call('createProveedor', datos);
        }
        cerrarModal();
        cacheProveedores = await Api.call('listProveedores');
        renderLista(cacheProveedores);
      } catch (err) {
        errorBox.textContent = err.message;
        errorBox.hidden = false;
      }
    });
  }

  function cerrarModal() {
    document.getElementById('modal-root').innerHTML = '';
  }

  return { render };
})();
