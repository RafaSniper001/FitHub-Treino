// FitHub Treino - Módulo Inicializador e Centralizador (main.js)
// Desenvolvedor: Rafael

let geminiApiKey = "";
const FALLBACK_TIPS = [
  "Entendido, Rafael. Lembre-se de controlar sempre o movimento, principalmente na descida do peso (fase excêntrica), e manter a respiração contínua sem fazer apneia.",
  "Mantenha o foco, Rafael! A consistência supera a intensidade no longo prazo. Qual o próximo grupo muscular que vamos esmagar hoje?",
  "Foco total na execução! Carga alta sem técnica adequada só gera lesões. Reduza o peso se necessário para manter a postura de atleta perfeita.",
  "Não sabote sua amplitude de movimento. É muito melhor realizar repetições completas com menos peso do que repetições curtas roubando na postura.",
  "Mantenha o abdômen contraído (bracing) em todos os exercícios livres para estabilizar a coluna lombar e proteger suas costas.",
  "A conexão mente-músculo é fundamental. Concentre-se no músculo-alvo se contraindo a cada repetição e sinta a fibra trabalhar.",
  "O descanso de qualidade e a ingestão de proteínas são os pilares do ganho de massa. Como está sua alimentação e hidratação hoje?",
  "Se o treino parecer difícil, lembre-se: a última repetição antes da falha mecânica é a que realmente sinaliza hipertrofia de alto nível.",
  "Mantenha-se hidratado durante a sessão. Pequenos goles de água entre as séries ajudam a manter o rendimento e força muscular.",
  "Sempre inicie seu treino aquecendo com cargas mais leves no primeiro exercício para lubrificar as articulações e preparar o sistema nervoso."
];
let fallbackTipIndex = 0;

// 1. Inicialização do Aplicativo
window.addEventListener('DOMContentLoaded', () => {
  // Inicializa autenticação (Login/Cadastro)
  initAuth();

  // Carrega configurações da API Gemini
  geminiApiKey = localStorage.getItem('fithub_gemini_key') || "";
  const keyInput = document.getElementById('gemini-key-input');
  if (keyInput) keyInput.value = geminiApiKey;
  updateAiModeBadge();

  // Carrega velocidade de fala customizada
  const savedRate = localStorage.getItem('fithub_voice_rate');
  const rateInput = document.getElementById('voice-rate-input');
  if (savedRate && rateInput) {
    rateInput.value = savedRate;
  }

  // Carrega estatísticas do Dashboard
  loadStats();

  // Carrega a lista de fichas de treino
  loadWorkouts();

  // Popula a biblioteca de exercícios
  renderLibrary();

  // Configura o reconhecimento de voz
  initVoiceCommands();

  // Inicializa marcadores do HUD da câmera
  initTrackerPoints();

  // Renderiza gráfico semanal
  renderWeeklyChart();

  // Renderiza galeria de fotos de progresso
  renderSnapshotsGallery();

  // Mensagem inicial de boas-vindas do A.R.E.S. no chat
  addAresChatMessage("Seja bem-vindo de volta, Rafael. Treinador A.R.E.S. pronto para orientar seu treino físico. Selecione uma Ficha de Treino e vamos começar a ajustar sua carga e sua técnica biomecânica.");
});

// 2. Sistema de Abas (Navegação)
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

  const contentEl = document.getElementById(`content-${tabId}`);
  const btnEl = document.getElementById(`tab-btn-${tabId}`);

  if (contentEl) contentEl.classList.add('active');
  if (btnEl) btnEl.classList.add('active');

  if (tabId === 'library') {
    renderLibrary();
  } else if (tabId === 'dashboard') {
    renderWeeklyChart();
  }

  if (tabId === 'camera') {
    activeWebcamElement = document.getElementById('tab-webcam');
    activeCanvasElement = document.getElementById('tab-cam-overlay');
  } else {
    // Para a câmera se não estivermos no treino ativo
    if (!activeWorkout && webcamStream) {
      stopWebcam();
    }
  }
}

// 3. Efeitos de Áudio Sintetizados (Web Audio API)
function playSynthesizedSound(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'success') {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.04, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } else if (type === 'alarm') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.2);
      osc.frequency.linearRampToValueAtTime(400, now + 0.4);
      osc.frequency.linearRampToValueAtTime(600, now + 0.6);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.75);
    }
  } catch (e) {
    console.error("Audio synthesis error", e);
  }
}

// 4. Exibição de Toasts de Notificação
function showToast(message) {
  const toast = document.getElementById('notification-toast');
  const msg = document.getElementById('notification-message');
  
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

// 5. Configurações de API e Modo do Coach
function saveGeminiKey() {
  const keyVal = document.getElementById('gemini-key-input').value.trim();
  localStorage.setItem('fithub_gemini_key', keyVal);
  geminiApiKey = keyVal;
  updateAiModeBadge();
  showToast("Chave API do Gemini Atualizada!");
}

function saveVoiceSettings() {
  const rateInput = document.getElementById('voice-rate-input');
  if (rateInput) {
    localStorage.setItem('fithub_voice_rate', rateInput.value);
  }
}

function updateAiModeBadge() {
  const badge = document.getElementById('ai-mode-status');
  const statusHeader = document.getElementById('ai-chat-header-status');
  if (!badge || !statusHeader) return;

  if (geminiApiKey) {
    badge.textContent = "IA GEMINI CONECTADA";
    badge.style.color = "var(--accent-orange)";
    statusHeader.textContent = "A.R.E.S. COGNITIVO ATIVO";
    statusHeader.style.color = "var(--accent-orange)";
  } else {
    badge.textContent = "LOCAL COACH";
    badge.style.color = "var(--text-muted)";
    statusHeader.textContent = "A.R.E.S. COACH LOCAL";
    statusHeader.style.color = "var(--text-muted)";
  }
}

// 6. Integração do Chat Cognitivo
async function getAiResponse(userMessage) {
  const msgBox = addAresChatMessage("Processando resposta do treinador...");
  
  const prompt = `
    Você é o A.R.E.S. (Autonomous Real-time Exercise System), um treinador e personal trainer profissional de alta performance e musculação. 
    Seu objetivo é orientar o Rafael sobre treinos, cargas, posturas e biomecânica com seriedade, incentivo e base em educação física.
    Não fale sobre robôs, militares ou ficção científica. Responda como um personal trainer experiente e motivador.
    Responda em PORTUGUÊS de forma direta e curta (máximo 3 frases).
    Pergunta do Rafael: "${userMessage}"
  `;

  let replyText = "";
  
  if (geminiApiKey) {
    try {
      replyText = await fetchGeminiResponse(prompt, geminiApiKey);
    } catch (err) {
      console.error(err);
      replyText = getLocalFallbackResponse(userMessage) + " (Nota: Erro com API do Gemini. Usando coach local).";
    }
  } else {
    replyText = getLocalFallbackResponse(userMessage);
  }

  msgBox.innerHTML = `"${replyText}"`;
  speakVoiceResponse(replyText);
  
  const quickEl = document.getElementById('ai-quick-response');
  if (quickEl) quickEl.textContent = `"${replyText}"`;
}

async function fetchGeminiResponse(prompt, key) {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.75
      }
    })
  });
  
  if (!response.ok) {
    throw new Error("Gemini API call failed");
  }

  const data = await response.json();
  if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error("Invalid response format");
}

function getLocalFallbackResponse(msg) {
  const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const text = normalize(msg);
  
  if (text.includes("ola") || text.includes("oi") || text.includes("bom dia") || text.includes("boa tarde") || text.includes("boa noite")) {
    return "Fala Rafael! Pronto para treinar hoje? Qual o foco do treino para atingirmos a falha mecânica com consistência?";
  }
  if (text.includes("supino") || text.includes("peito") || text.includes("peitoral") || text.includes("chest")) {
    return "Para treinar peitoral com eficiência, mantenha as escápulas aduzidas no banco, os ombros para trás e empurre o peso focando na contração das fibras do peito, sem esticar os cotovelos totalmente no topo.";
  }
  if (text.includes("biceps") || text.includes("rosca") || text.includes("braço") || text.includes("braco")) {
    return "No treino de bíceps (como rosca direta ou martelo), evite usar o balanço do corpo. Mantenha os cotovelos firmes nas costelas e controle a descida (fase excêntrica) para gerar o máximo de microlesões.";
  }
  if (text.includes("triceps") || text.includes("pulley") || text.includes("corda") || text.includes("frances")) {
    return "Para tríceps, estabilize bem o ombro. Na polia com corda ou barra, estenda os braços completamente para baixo e contraia o tríceps no final do movimento, controlando o retorno sem deixar o peso subir rápido demais.";
  }
  if (text.includes("agachamento") || text.includes("perna") || text.includes("pernas") || text.includes("leg") || text.includes("quadriceps") || text.includes("coxa")) {
    return "No treino de pernas, a amplitude é fundamental. No agachamento livre ou Leg Press, desça até onde conseguir sem perder o alinhamento da coluna lombar, mantendo os joelhos alinhados com a ponta dos pés.";
  }
  if (text.includes("costas") || text.includes("puxada") || text.includes("remada") || text.includes("dorsal") || text.includes("dorsais")) {
    return "No treino de costas, o segredo é iniciar a puxada pelas escápulas e cotovelos, e não pelas mãos. Concentre-se em fechar as asas e esmagar a dorsal, mantendo o abdômen contraído.";
  }
  if (text.includes("ombro") || text.includes("ombros") || text.includes("desenvolvimento") || text.includes("elevacao") || text.includes("deltoide")) {
    return "Para deltoides marcados, combine desenvolvimento (foco em força) com elevação lateral. Na elevação lateral, não suba os halteres além da linha dos ombros e mantenha o polegar levemente apontado para baixo.";
  }
  if (text.includes("abdomen") || text.includes("abdominal") || text.includes("prancha")) {
    return "O abdômen deve ser treinado como qualquer outro músculo: com carga e cadência. Concentre-se em enrolar a coluna vertebral na flexão abdominal, em vez de apenas subir o tronco usando o quadril.";
  }
  if (text.includes("cardio") || text.includes("esteira") || text.includes("corrida") || text.includes("aerobico")) {
    return "O cardio é vital para a saúde cardiovascular e otimização do metabolismo. Para hipertrofia, faça-o de preferência após o treino de musculação ou em horários separados para não esgotar o glicogênio.";
  }
  if (text.includes("dieta") || text.includes("proteina") || text.includes("comer") || text.includes("alimenta") || text.includes("suplemento") || text.includes("creatina")) {
    return "Para ganho de massa ou definição, o balanço de macronutrientes é crucial. Consuma cerca de 1.6g a 2.0g de proteína por kg corporal diariamente, beba muita água e considere suplementar creatina para força.";
  }
  if (text.includes("cansado") || text.includes("dificil") || text.includes("desistir") || text.includes("preguica") || text.includes("desanimado")) {
    return "O desânimo é passageiro, mas a disciplina é permanente. Lembre-se do seu objetivo, reduza a carga se necessário, mas não falte ao treino de hoje. Cada treino conta!";
  }
  if (text.includes("carga") || text.includes("peso") || text.includes("aumentar") || text.includes("progressao")) {
    return "A progressão de carga é a chave da hipertrofia. Se você consegue completar a faixa estipulada de repetições com execução perfeita em todas as séries, aumente o peso na próxima sessão de forma gradual.";
  }
  if (text.includes("alongamento") || text.includes("aquecimento") || text.includes("mobilidade")) {
    return "Sempre inicie o treino com mobilidade articular e aquecimento específico na primeira máquina com carga leve. O alongamento estático intenso deve ser feito longe do horário de treino de força.";
  }
  if (text.includes("quem e voce") || text.includes("ares") || text.includes("seu nome") || text.includes("criador")) {
    return "Eu sou o A.R.E.S., seu treinador inteligente. Fui desenvolvido para ajudar você, Rafael, a alcançar o seu máximo desempenho físico, ajustando suas fichas, postura e cargas.";
  }

  const tip = FALLBACK_TIPS[fallbackTipIndex];
  fallbackTipIndex = (fallbackTipIndex + 1) % FALLBACK_TIPS.length;
  return tip;
}

function addUserChatMessage(text) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;
  const msg = document.createElement('div');
  msg.className = "chat-msg user";
  msg.innerHTML = `
    <span class="msg-sender">RAFAEL</span>
    <div class="msg-bubble">${text}</div>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function addAresChatMessage(text) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return { querySelector: () => null };
  const msg = document.createElement('div');
  msg.className = "chat-msg ares";
  msg.innerHTML = `
    <span class="msg-sender">TREINADOR A.R.E.S.</span>
    <div class="msg-bubble">${text}</div>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  return msg.querySelector('.msg-bubble');
}

function sendChatMessage() {
  const input = document.getElementById('chat-user-input');
  if (!input) return;
  const txt = input.value.trim();
  if (!txt) return;

  addUserChatMessage(txt);
  input.value = "";
  getAiResponse(txt);
}

// 7. Renderização da Biblioteca de Exercícios
function renderLibrary() {
  const container = document.getElementById('exercises-grid-container');
  if (!container) return;
  container.innerHTML = "";

  const countEl = document.getElementById('library-count');
  if (countEl) countEl.textContent = DEFAULT_EXERCISES.length;

  DEFAULT_EXERCISES.forEach(ex => {
    const card = document.createElement('div');
    card.className = "exercise-card";
    card.setAttribute('data-muscle', ex.muscle);

    const canvasId = `wireframe-canvas-${ex.id}`;
    
    card.innerHTML = `
      <div class="ex-card-media">
        <canvas id="${canvasId}" class="ex-card-wireframe"></canvas>
        <span class="ex-card-badge">${ex.muscle.toUpperCase()}</span>
      </div>
      <div class="ex-card-content">
        <h4 class="ex-card-title">${ex.name}</h4>
        <p class="ex-card-desc">${ex.desc}</p>
        <div class="ex-card-meta">
          <span>Equipamento: <strong>${ex.equipment}</strong></span>
          <span>Nível: <strong>${ex.difficulty}</strong></span>
        </div>
      </div>
    `;
    
    container.appendChild(card);
    setTimeout(() => drawWireframeSvg(canvasId, ex.wireframe), 50);
  });
}

function filterLibrary(muscle) {
  document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
  
  if (muscle === 'all') {
    const btnAll = document.getElementById('btn-filter-all');
    if (btnAll) btnAll.classList.add('active');
  } else {
    const idMap = {
      'Peito': 'btn-filter-peito',
      'Costas': 'btn-filter-costas',
      'Pernas': 'btn-filter-pernas',
      'Ombros': 'btn-filter-ombros',
      'Bíceps': 'btn-filter-biceps',
      'Tríceps': 'btn-filter-triceps',
      'Abdômen': 'btn-filter-abdomen'
    };
    const btnFilter = document.getElementById(idMap[muscle]);
    if (btnFilter) btnFilter.classList.add('active');
  }

  const cards = document.querySelectorAll('.exercise-card');
  let visibleCount = 0;
  
  cards.forEach(card => {
    const m = card.getAttribute('data-muscle');
    if (muscle === 'all' || m === muscle) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  const countEl = document.getElementById('library-count');
  if (countEl) countEl.textContent = visibleCount;
}

function searchLibrary() {
  const inputEl = document.getElementById('search-exercise-input');
  if (!inputEl) return;
  const query = inputEl.value.toLowerCase();
  const cards = document.querySelectorAll('.exercise-card');
  
  let visibleCount = 0;
  cards.forEach(card => {
    const title = card.querySelector('.ex-card-title').textContent.toLowerCase();
    const desc = card.querySelector('.ex-card-desc').textContent.toLowerCase();

    if (title.includes(query) || desc.includes(query)) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  const countEl = document.getElementById('library-count');
  if (countEl) countEl.textContent = visibleCount;
}
