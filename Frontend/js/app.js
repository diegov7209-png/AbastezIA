/**
 * app.js
 * Bootstrap de la app: registra páginas, dibuja navegación mobile/desktop
 * y arranca el router.
 */
const App = (() => {
  const NAV_ITEMS = [
    { key: 'dashboard', label: 'Inicio', icon: '🏠' },
    { key: 'chat', label: 'Chat', icon: '💬' },
    { key: 'proveedores', label: 'Proveedores', icon: '🚚' },
    { key: 'productos', label: 'Productos', icon: '📦' },
    { key: 'clientes', label: 'Clientes', icon: '🧾' }
  ];

  function updateNav(activeKey) {
    document.querySelectorAll('[data-nav-key]').forEach((el) => {
      el.classList.toggle('active', el.dataset.navKey === activeKey);
    });
  }

  function renderNav() {
    const mobileNav = document.getElementById('nav-mobile');
    const desktopNav = document.getElementById('nav-desktop');
    const itemsHtml = NAV_ITEMS.map(
      (item) => `<a href="#/${item.key}" data-nav-key="${item.key}">
                   <span class="nav-icon">${item.icon}</span>
                   <span class="nav-label">${item.label}</span>
                 </a>`
    ).join('');
    mobileNav.innerHTML = itemsHtml;
    desktopNav.innerHTML = itemsHtml;
  }

  function renderHeader() {
    const session = Auth.getSession();
    const headerUser = document.getElementById('header-user');
    if (session) {
      headerUser.innerHTML = `
        <span class="user-name">${session.nombre} <span class="user-role">(${session.rol})</span></span>
        <button id="logout-btn" class="btn-link">Salir</button>`;
      document.getElementById('logout-btn').addEventListener('click', Auth.logout);
    } else {
      headerUser.innerHTML = '';
    }
  }

  function init() {
    Router.register('login', PageLogin);
    Router.register('dashboard', PageDashboard);
    Router.register('proveedores', PageProveedores);
    Router.register('productos', PageProductos);
    Router.register('clientes', PageClientes);
    Router.register('chat', PageChat);
    Router.register('notfound', { render: (el) => { el.innerHTML = '<p>Página no encontrada.</p>'; } });

    renderNav();
    renderHeader();
    Router.renderFromHash();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  }

  return { init, updateNav, renderHeader };
})();

document.addEventListener('DOMContentLoaded', App.init);
