/**
 * auth.js
 * Maneja la sesión en localStorage (token emitido por Auth.gs en el backend).
 */
const Auth = (() => {
  const KEY = 'distribuidora_session';

  function getSession() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function getToken() {
    const s = getSession();
    return s ? s.token : null;
  }

  function isLoggedIn() {
    return !!getToken();
  }

  async function login(email, password) {
    const data = await Api.call('login', { email, password });
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  function logout() {
    localStorage.removeItem(KEY);
    Router.go('login');
  }

  return { getSession, getToken, isLoggedIn, login, logout };
})();
