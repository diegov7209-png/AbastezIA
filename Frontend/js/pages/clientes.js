const PageClientes = (() => {
  let cache = [];

  async function render(el) {
    el.innerHTML = `
      <div class="page-header">
        <h1>Clientes</h1>
        <button id="btn-nuevo" class="btn-primary btn-small">+ Nuevo</button>
      </div>
      <input type="search" id="buscador" class="input-search" placeholder="Buscar cliente…">
      <div id="lista" class="card-list"><div class="loading">Cargando…</div></div>
      <div id="modal-root"></div>`;

    document.getElementById('btn-nuevo').addEventListener('click', abrirFormulario);
    document.getElementById('buscador').addEventListener('input', (e) => renderLista(filtrar(e.target.value)));

    cache = await Api.call('listClientes');
    renderLista(cache);
  }

  function filtrar(texto) {
    const t = texto.toLowerCase();
    return cache.filter((c) => (c.nombre || '').toLowerCase().includes(t));
  }

  function renderLista(lista) {
    const cont = document.getElementById('lista');
    if (lista.length === 0) {
      cont.innerHTML = '<p class="empty">No hay clientes todavía.</p>';
      return;
    }
    cont.innerHTML = lista.map((c) => `
      <div class="card-item">
        <div class="card-item-title">${c.nombre}</div>
        <div class="card-item-sub">${c.empresa || ''} · ${c.ciudad || ''}</div>
        <div class="card-item-badge badge-neutral">${c.tipo_cliente || ''}</div>
      </div>`).join('');
  }

  function abrirFormulario() {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <button class="modal-close" id="modal-close">✕</button>
          <h2>Nuevo cliente</h2>
          <form id="form" class="form-stack">
            <label>Nombre <input name="nombre" required></label>
            <label>Empresa <input name="empresa"></label>
            <label>Ciudad <input name="ciudad"></label>
            <label>Teléfono <input name="telefono"></label>
            <label>WhatsApp <input name="whatsapp"></label>
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
        await Api.call('createCliente', datos);
        modal.innerHTML = '';
        cache = await Api.call('listClientes');
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
