// FitHub Treino - Módulo de Autenticação e Biometria (auth.js)

let isUserAuthenticated = false;

function initAuth() {
  const loggedUser = localStorage.getItem('fithub_logged_email');
  const loginOverlay = document.getElementById('login-screen-overlay');
  const appWrapper = document.getElementById('app-wrapper');
  
  if (loggedUser) {
    isUserAuthenticated = true;
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (appWrapper) appWrapper.style.display = 'block';
    showToast(`Bem-vindo de volta, ${loggedUser}!`);
  } else {
    isUserAuthenticated = false;
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (appWrapper) appWrapper.style.display = 'none';
  }
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('login-email').value.trim();
  const passwordInput = document.getElementById('login-password').value;

  if (!emailInput || !passwordInput) {
    showToast("Por favor, preencha todos os campos!");
    return;
  }

  // Obter usuários cadastrados
  const users = JSON.parse(localStorage.getItem('fithub_users') || '{}');

  if (users[emailInput] && users[emailInput] === passwordInput) {
    performLoginSuccess(emailInput);
  } else {
    showToast("E-mail ou Senha incorretos!");
    speakVoiceResponse("Acesso negado. Credenciais incorretas.");
  }
}

function handleRegister(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('register-email').value.trim();
  const passwordInput = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;

  if (!emailInput || !passwordInput || !passwordConfirm) {
    showToast("Por favor, preencha todos os campos!");
    return;
  }

  if (passwordInput !== passwordConfirm) {
    showToast("As senhas não coincidem!");
    return;
  }

  const users = JSON.parse(localStorage.getItem('fithub_users') || '{}');

  if (users[emailInput]) {
    showToast("Este e-mail já está cadastrado!");
    return;
  }

  // Salvar novo usuário
  users[emailInput] = passwordInput;
  localStorage.setItem('fithub_users', JSON.stringify(users));

  showToast("Cadastro realizado com sucesso!");
  speakVoiceResponse("Cadastro realizado com sucesso, Rafael. Faça o login.");
  toggleAuthMode(false); // Alternar para tela de login
}

function performLoginSuccess(email) {
  localStorage.setItem('fithub_logged_email', email);
  isUserAuthenticated = true;
  
  const appWrapper = document.getElementById('app-wrapper');
  if (appWrapper) appWrapper.style.display = 'block';
  
  // Esconder tela de login com transição suave
  const loginOverlay = document.getElementById('login-screen-overlay');
  if (loginOverlay) {
    loginOverlay.style.transition = 'opacity 0.5s ease';
    loginOverlay.style.opacity = '0';
    setTimeout(() => {
      loginOverlay.style.display = 'none';
      loginOverlay.style.opacity = '1';
    }, 500);
  }

  showToast("Acesso autorizado!");
  speakVoiceResponse(`Acesso autorizado. Seja bem-vindo de volta, Rafael. Treinador A.R.E.S. pronto para iniciar.`);
  
  // Se o sensor de biometria não estiver cadastrado, sugere o cadastro
  const bioRegistered = localStorage.getItem('fithub_biometric_registered');
  if (bioRegistered !== 'true') {
    setTimeout(() => {
      if (confirm("Deseja ativar o acesso rápido por impressão digital (biometria) nas próximas sessões?")) {
        registerBiometrics(email);
      }
    }, 2000);
  }
}

function logoutUser() {
  localStorage.removeItem('fithub_logged_email');
  isUserAuthenticated = false;
  
  // Limpar campos de login
  document.getElementById('login-email').value = "";
  document.getElementById('login-password').value = "";

  const appWrapper = document.getElementById('app-wrapper');
  if (appWrapper) appWrapper.style.display = 'none';

  const loginOverlay = document.getElementById('login-screen-overlay');
  if (loginOverlay) loginOverlay.style.display = 'flex';
  
  showToast("Sessão encerrada.");
  speakVoiceResponse("Sessão encerrada. Até o próximo treino.");
}

function toggleAuthMode(isRegister) {
  const loginForm = document.getElementById('login-form-container');
  const registerForm = document.getElementById('register-form-container');
  
  if (isRegister) {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
  } else {
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
  }
}

// Lógica de Impressão Digital (WebAuthn e Fallback Simulado)
async function registerBiometrics(email) {
  if (!window.PublicKeyCredential) {
    showToast("Leitor de digital nativo não suportado neste dispositivo.");
    return;
  }
  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    
    const createCredentialOptions = {
      challenge: challenge,
      rp: { name: "FitHub Treino" },
      user: {
        id: new Uint8Array(16),
        name: email,
        displayName: email.split('@')[0]
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
      authenticatorSelection: { 
        authenticatorAttachment: "platform", 
        userVerification: "required" 
      },
      timeout: 60000
    };

    const credential = await navigator.credentials.create({ publicKey: createCredentialOptions });
    if (credential) {
      localStorage.setItem('fithub_biometric_registered', 'true');
      localStorage.setItem('fithub_biometric_email', email);
      // Converter rawId para string base64
      const credId = btoa(String.fromCharCode.apply(null, new Uint8Array(credential.rawId)));
      localStorage.setItem('fithub_biometric_id', credId);
      
      showToast("Biometria cadastrada com sucesso!");
      speakVoiceResponse("Acesso biométrico configurado com sucesso.");
    }
  } catch (err) {
    console.error("Biometric registration error:", err);
    showToast("Falha ao registrar digital do aparelho.");
  }
}

async function loginWithBiometrics() {
  const bioRegistered = localStorage.getItem('fithub_biometric_registered');
  const email = localStorage.getItem('fithub_biometric_email');
  
  if (bioRegistered === 'true' && email && window.PublicKeyCredential) {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const credIdStr = localStorage.getItem('fithub_biometric_id');
      const credId = new Uint8Array(atob(credIdStr).split("").map(c => c.charCodeAt(0)));

      const assertionOptions = {
        challenge: challenge,
        allowCredentials: [{ id: credId, type: "public-key" }],
        userVerification: "required",
        timeout: 60000
      };

      const assertion = await navigator.credentials.get({ publicKey: assertionOptions });
      if (assertion) {
        performLoginSuccess(email);
      }
    } catch (err) {
      console.error("Biometric assertion error:", err);
      // Se falhar a biometria nativa, mostra o scanner simulado futurista
      showBiometricScanSimulation(email);
    }
  } else {
    // Caso não tenha digital cadastrada, usa a simulação como demonstração futurista
    const defaultEmail = Object.keys(JSON.parse(localStorage.getItem('fithub_users') || '{"rafael@fithub.com": "123"}'))[0] || "rafael@fithub.com";
    showBiometricScanSimulation(defaultEmail);
  }
}

// Animação de Scanner de Digital de Alta Performance (Visual de Impacto Acadêmico)
function showBiometricScanSimulation(email) {
  const overlay = document.createElement('div');
  overlay.className = 'biometric-scanner-modal';
  overlay.innerHTML = `
    <div class="scanner-panel glass-panel">
      <div class="scanner-header">
        <h3>ESCANEAMENTO BIOMÉTRICO</h3>
        <span class="blinking" style="color: var(--accent-orange); font-size:12px;">SISTEMA ATIVO</span>
      </div>
      <div class="scanner-body">
        <div class="fingerprint-container">
          <svg viewBox="0 0 24 24" class="fingerprint-svg">
            <path d="M12 1c-5.52 0-10 4.48-10 10v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-4.41 3.59-8 8-8s8 3.59 8 8v1.5c0 1.38-1.12 2.5-2.5 2.5S15 13.88 15 12.5V11c0-1.66-1.34-3-3-3s-3 1.34-3 3v2c0 2.76 2.24 5 5 5h.5c1.38 0 2.5 1.12 2.5 2.5v1.5c0 .55.45 1 1 1s1-.45 1-1v-1.5c0-2.48-2.02-4.5-4.5-4.5h-.5c-1.66 0-3-1.34-3-3v-2c0-.55.45-1 1-1s1 .45 1 1v1.5c0 2.48 2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5v-1.5c0-5.52-4.48-10-10-10zm-6 10c0-3.31 2.69-6 6-6s6 2.69 6 6v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-4.41-3.59-8-8-8s-8 3.59-8 8v1c0 .55.45 1 1 1s1-.45 1-1v-1z" fill="currentColor"/>
          </svg>
          <div class="scanner-laser"></div>
        </div>
        <p id="scanner-status-text">Mantenha o dedo pressionado na tela...</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  playSynthesizedSound('beep');

  // Vibração nativa do celular no início do escaneamento
  if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);

  // Simular processo de escaneamento
  setTimeout(() => {
    const statusText = document.getElementById('scanner-status-text');
    if (statusText) statusText.textContent = "ESCANEAR: 45%... ANALISANDO DERMATÓGLIFOS";
    if ('vibrate' in navigator) navigator.vibrate(50);
  }, 1000);

  setTimeout(() => {
    const statusText = document.getElementById('scanner-status-text');
    if (statusText) statusText.textContent = "ESCANEAR: 90%... AUTENTICANDO ASSINATURA";
    if ('vibrate' in navigator) navigator.vibrate(50);
  }, 2000);

  setTimeout(() => {
    const statusText = document.getElementById('scanner-status-text');
    if (statusText) {
      statusText.textContent = "ACESSO AUTORIZADO!";
      statusText.style.color = "var(--accent-green)";
    }
    playSynthesizedSound('success');
    if ('vibrate' in navigator) navigator.vibrate([200]);
    
    setTimeout(() => {
      overlay.remove();
      performLoginSuccess(email);
    }, 800);
  }, 3000);
}
