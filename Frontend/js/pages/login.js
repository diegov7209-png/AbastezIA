const PageLogin = (() => {
  async function render(el) {
    el.innerHTML = `
      <div class="login-screen">
        <h1 class="login-title">Distribuidora AI</h1>
        <p class="login-subtitle">Inicia sesión para continuar</p>
        <form id="login-form" class="form-stack">
          <label>Correo
            <input type="email" name="email" required autocomplete="username">
          </label>
          <label>Contraseña
            <input type="password" name="password" required autocomplete="current-password">
          </label>
          <div id="login-error" class="error-box" hidden></div>
          <button type="submit" class="btn-primary">Entrar</button>
        </form>
      </div>`;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const errorBox = document.getElementById('login-error');
      errorBox.hidden = true;
      try {
        await Auth.login(form.email.value, form.password.value);
        App.renderHeader();
        Router.go('dashboard');
      } catch (err) {
        errorBox.textContent = err.message;
        errorBox.hidden = false;
      }
    });
  }
  return { render };
})();
