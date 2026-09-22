/**
 * router.js
 * Router mínimo por hash (#/ruta), sin dependencias — funciona igual
 * subiendo la carpeta tal cual a GitHub Pages, sin configuración de servidor.
 */
const Router = (() => {
  const routes = {};
  let currentPage = null;

  function register(name, pageModule) {
    routes[name] = pageModule;
  }

  function go(name) {
    window.location.hash = '#/' + name;
  }

  async function renderFromHash() {
    const name = (window.location.hash.replace('#/', '') || 'dashboard').split('?')[0];
    const publicRoutes = ['login'];

    if (!Auth.isLoggedIn() && publicRoutes.indexOf(name) === -1) {
      return go('login');
    }
    if (Auth.isLoggedIn() && name === 'login') {
      return go('dashboard');
    }

    const page = routes[name] || routes['notfound'];
    const outlet = document.getElementById('app-outlet');
    outlet.innerHTML = '<div class="loading">Cargando…</div>';

    currentPage = page;
    App.updateNav(name);
    try {
      await page.render(outlet);
    } catch (err) {
      outlet.innerHTML = `<div class="error-box">Ocurrió un error: ${err.message}</div>`;
    }
  }

  window.addEventListener('hashchange', renderFromHash);

  return { register, go, renderFromHash };
})();
