const PageProductos = (() => {
  let cache = [];

  async function render(el) {
    el.innerHTML = `
      <div class="page-header">
        <h1>Productos</h1>
        <button id="btn-nuevo" class="btn-primary btn-small">+ Nuevo</button>
      </div>
      <input type="search" id="buscador" class="input-search" placeholder="Buscar producto…">
      <div id="lista" class="card-list"><div class="loading">Cargando…</div></div>
      <div id="modal-root"></div>`;

    document.getElementById('btn-nuevo').addEventListener('click', abrirFormulario);
    document.getElementById('buscador').addEventListener('input', (e) => renderLista(filtrar(e.target.value)));

    cache = await Api.call('listProductos');
    renderLista(cache);
  }

  function filtrar(texto) {
    const t = texto.toLowerCase();
    return cache.filter((p) => (p.nombre || '').toLowerCase().includes(t));
  }

  function renderLista(lista) {
    const cont = document.getElementById('lista');
    if (lista.length === 0) {
      cont.innerHTML = '<p class="empty">No hay productos todavía.</p>';
      return;
    }
    cont.innerHTML = lista.map((p) => `
      <div class="card-item">
        <div class="card-item-title">${p.nombre}</div>
        <div class="card-item-sub">${p.categoria || 'Sin categoría'} · ${p.unidad_medida || ''}</div>
        <div class="card-item-badge badge-neutral">$${p.precio_venta || '—'}</div>
      </div>`).join('');
  }

  function abrirFormulario() {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <button class="modal-close" id="modal-close">✕</button>
          <h2>Nuevo producto</h2>
          <form id="form" class="form-stack">
            <label>Nombre <input name="nombre" required></label>
            <label>Categoría <input name="categoria"></label>
            <label>Unidad de medida <input name="unidad_medida" placeholder="kg, pieza, caja…"></label>
            <label>Precio de venta <input name="precio_venta" type="number" step="0.01"></label>
            <div id="form-error" class="error-box" hidden></div>
            <button type="submit" class="btn-primary">Guardar</button>
          </form>
        </div>
      </div>`;
    document.getElementById('modal-close').addEventListener('click', () => { modal.innerHTML = ''; });
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const datos = Object.fromEntries(new FormData(e.target).entries());
      try {
        await Api.call('createProducto', datos);
        modal.innerHTML = '';
        cache = await Api.call('listProductos');
        renderLista(cache);
      } catch (err) {
        const box = document.getElementById('form-error');
        box.textContent = err.message;
        box.hidden = false;
      }
    });
  }

  return { render };
})();
