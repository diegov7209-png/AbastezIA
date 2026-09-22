/**
 * api.js
 * Único punto de contacto con el backend. Todo pasa por call().
 */
const Api = (() => {
  function backendUrl() {
    return window.DISTRIBUIDORA_CONFIG.BACKEND_URL;
  }

  async function call(action, payload = {}) {
    const token = Auth.getToken();
    const res = await fetch(backendUrl(), {
      method: 'POST',
      // text/plain evita el preflight OPTIONS, que Apps Script Web Apps no maneja bien
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token, payload })
    });

    if (!res.ok) throw new Error('Error de red al contactar el backend');
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Error desconocido del backend');
    return json.data;
  }

  return { call };
})();
