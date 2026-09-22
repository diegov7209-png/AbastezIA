const PageChat = (() => {
  async function render(el) {
    el.innerHTML = `
      <div class="chat-screen">
        <div id="chat-log" class="chat-log">
          <div class="chat-bubble chat-bubble-ai">
            Hola, soy el asistente de Distribuidora AI. Puedes pedirme cosas como
            "¿quién vende plátano?" o "necesito 500 kg de plátano para el jueves en Bucerías".
            También puedes subir un catálogo con el clip 📎.
          </div>
        </div>
        <form id="chat-form" class="chat-input-bar">
          <label class="chat-attach">
            📎<input type="file" id="chat-file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv" hidden>
          </label>
          <input type="text" id="chat-input" placeholder="Escribe un mensaje…" autocomplete="off">
          <button type="submit" class="btn-primary btn-small">Enviar</button>
        </form>
      </div>`;

    document.getElementById('chat-form').addEventListener('submit', onEnviar);
    document.getElementById('chat-file').addEventListener('change', onArchivo);
  }

  function agregarBurbuja(texto, tipo) {
    const log = document.getElementById('chat-log');
    const div = document.createElement('div');
    div.className = `chat-bubble chat-bubble-${tipo}`;
    div.textContent = texto;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  async function onEnviar(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const mensaje = input.value.trim();
    if (!mensaje) return;
    agregarBurbuja(mensaje, 'user');
    input.value = '';
    agregarBurbuja('Pensando…', 'ai-loading');

    try {
      const data = await Api.call('chatMessage', { mensaje });
      quitarUltimoLoading();
      agregarBurbuja(data.respuesta, 'ai');
    } catch (err) {
      quitarUltimoLoading();
      agregarBurbuja('Error: ' + err.message, 'ai');
    }
  }

  function quitarUltimoLoading() {
    const log = document.getElementById('chat-log');
    const loadingBubble = log.querySelector('.chat-bubble-ai-loading:last-child');
    if (loadingBubble) loadingBubble.remove();
  }

  async function onArchivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    agregarBurbuja(`Subiendo ${file.name}…`, 'user');

    const base64 = await fileToBase64(file);
    try {
      const subida = await Api.call('uploadDocument', {
        base64Data: base64, mimeType: file.type, fileName: file.name, tipo: 'catalogo_proveedor'
      });
      agregarBurbuja('Documento guardado. Analizando con IA…', 'ai-loading');
      const analisis = await Api.call('analyzeUploadedDocument', { driveFileId: subida.driveFileId });
      quitarUltimoLoading();
      mostrarResumenExtraccion(analisis, subida.driveFileId);
    } catch (err) {
      agregarBurbuja('Error al procesar el documento: ' + err.message, 'ai');
    }
  }

  function mostrarResumenExtraccion(analisis, driveFileId) {
    const ex = analisis.extraido;
    const log = document.getElementById('chat-log');
    const div = document.createElement('div');
    div.className = 'chat-bubble chat-bubble-ai chat-bubble-confirm';
    div.innerHTML = `
      <p><strong>Detecté:</strong></p>
      <p>Proveedor: ${ex.proveedor.nombre_comercial || 'no detectado'}</p>
      <p>Productos: ${(ex.productos || []).length}</p>
      <p>Crédito: ${ex.condiciones.credito_disponible === null ? 'no especificado' : (ex.condiciones.credito_disponible ? 'sí' : 'no')}
      ${ex.condiciones.dias_credito ? `(${ex.condiciones.dias_credito} días)` : ''}</p>
      ${(ex.campos_ambiguos || []).length ? `<p class="warn">Campos sin confirmar: ${ex.campos_ambiguos.join(', ')}</p>` : ''}
      ${analisis.posiblesDuplicados.length ? `<p class="warn">Posible proveedor duplicado: ${analisis.posiblesDuplicados[0].nombre_comercial}</p>` : ''}
      <div class="chat-confirm-actions">
        <button class="btn-primary btn-small" id="btn-confirmar">Confirmar y guardar</button>
        <button class="btn-secondary btn-small" id="btn-cancelar">Cancelar</button>
      </div>`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;

    div.querySelector('#btn-confirmar').addEventListener('click', async () => {
      div.querySelector('.chat-confirm-actions').innerHTML = 'Guardando…';
      try {
        await Api.call('confirmExtractedData', { extraido: ex, driveFileId });
        div.querySelector('.chat-confirm-actions').innerHTML = '✅ Guardado en Proveedores y Productos';
      } catch (err) {
        div.querySelector('.chat-confirm-actions').innerHTML = 'Error: ' + err.message;
      }
    });
    div.querySelector('#btn-cancelar').addEventListener('click', () => div.remove());
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return { render };
})();
