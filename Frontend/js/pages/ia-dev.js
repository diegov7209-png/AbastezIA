/**
 * ia-dev.js
 * IA secundaria / desarrollador
 *
 * IMPORTANTE:
 * Esta IA NO ejecuta cambios automáticamente.
 * Cualquier acción que implique modificar datos, archivos,
 * configuración o ejecutar una operación requiere autorización
 * explícita del usuario.
 */

const PageIADev = (() => {

  let historial = [];

  async function render(el) {

    el.innerHTML = `
      <div class="ia-dev-screen">

        <div class="ia-dev-header">
          <div>
            <h1>🛠️ IA Dev</h1>
            <p>Asistente secundario para analizar y proponer cambios.</p>
          </div>

          <div class="ia-dev-status">
            <span class="ia-dev-dot"></span>
            Modo seguro
          </div>
        </div>

        <div class="ia-dev-warning">
          <strong>🔐 Control manual activado</strong>
          <span>
            Esta IA puede analizar, explicar y proponer cambios,
            pero no ejecutará ninguna modificación sin tu autorización.
          </span>
        </div>

        <div id="ia-dev-log" class="ia-dev-log">

          <div class="ia-dev-message ia-dev-message-ai">
            <div class="ia-dev-avatar">🤖</div>
            <div class="ia-dev-bubble">
              <strong>IA Dev</strong>
              <p>
                Soy la IA secundaria de Distribuidora AI.
                Puedo ayudarte a revisar el sistema, detectar errores,
                proponer código y preparar cambios.
              </p>
              <p>
                <strong>Nunca aplicaré un cambio sin pedirte autorización.</strong>
              </p>
            </div>
          </div>

        </div>

        <form id="ia-dev-form" class="ia-dev-input-bar">

          <textarea
            id="ia-dev-input"
            rows="1"
            placeholder="Escribe qué quieres revisar o modificar..."
            autocomplete="off"
          ></textarea>

          <button
            type="submit"
            class="btn-primary"
            id="ia-dev-send"
          >
            Enviar
          </button>

        </form>

      </div>
    `;

    const form = document.getElementById('ia-dev-form');
    const input = document.getElementById('ia-dev-input');

    form.addEventListener('submit', onEnviar);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

  }


  async function onEnviar(e) {

    e.preventDefault();

    const input = document.getElementById('ia-dev-input');
    const mensaje = input.value.trim();

    if (!mensaje) return;

    agregarMensaje(mensaje, 'user');

    input.value = '';

    const loading = agregarMensaje(
      'Analizando...',
      'loading'
    );

    try {

      const respuesta = await consultarIA(mensaje);

      if (loading) loading.remove();

      agregarMensaje(respuesta, 'ai');

    } catch (err) {

      if (loading) loading.remove();

      agregarMensaje(
        'Error al consultar la IA: ' + err.message,
        'error'
      );

    }

  }


  function agregarMensaje(texto, tipo) {

    const log = document.getElementById('ia-dev-log');

    if (!log) return null;

    const wrapper = document.createElement('div');

    wrapper.className =
      `ia-dev-message ia-dev-message-${tipo}`;

    const avatar =
      tipo === 'user'
        ? '👤'
        : tipo === 'error'
        ? '⚠️'
        : '🤖';

    wrapper.innerHTML = `
      <div class="ia-dev-avatar">${avatar}</div>

      <div class="ia-dev-bubble">
        <strong>
          ${
            tipo === 'user'
              ? 'Tú'
              : tipo === 'error'
              ? 'Error'
              : 'IA Dev'
          }
        </strong>

        <p></p>
      </div>
    `;

    wrapper.querySelector('p').textContent = texto;

    log.appendChild(wrapper);

    log.scrollTop = log.scrollHeight;

    if (tipo !== 'loading' && tipo !== 'error') {

      historial.push({
        tipo,
        texto,
        fecha: new Date().toISOString()
      });

    }

    return wrapper;
  }


  async function consultarIA(mensaje) {

    /*
     * Por ahora usamos el mismo sistema Api.call()
     * que utiliza el Chat principal.
     *
     * La IA Dev recibe un mensaje especial indicando
     * que debe funcionar como asistente técnico.
     */

    const prompt = `
Eres IA Dev, la IA secundaria de Distribuidora AI.

Tu función es ayudar a analizar el sistema, detectar errores,
explicar código y PROPONER cambios.

REGLA ABSOLUTA DE SEGURIDAD:

NO debes ejecutar, guardar, modificar, eliminar ni aplicar
ningún cambio automáticamente.

Si el usuario solicita una modificación:

1. Explica qué cambiarías.
2. Muestra claramente el cambio propuesto.
3. Explica qué archivos serían afectados.
4. Pregunta explícitamente si el usuario autoriza el cambio.
5. Solo después de recibir una autorización explícita se
   podrá preparar una operación de cambio.

Nunca interpretes frases ambiguas como autorización.

Mensaje del usuario:

${mensaje}
`;

    const data = await Api.call('chatMessage', {
      mensaje: prompt
    });

    if (!data) {
      throw new Error('La API no devolvió respuesta.');
    }

    return data.respuesta || data.message || JSON.stringify(data);

  }


  return {
    render
  };

})();
