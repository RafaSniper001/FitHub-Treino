// FitHub Treino - Core App Logic
// Developer: Rafael

// 1. Initial Exercise Database (Seed Data)
const DEFAULT_EXERCISES = [
  // Peito
  { id: "ex_supino_reto", name: "Supino Reto com Barra", muscle: "Peito", equipment: "Barra, Banco", difficulty: "Intermediário", desc: "Deitado no banco reto, empurre a barra verticalmente até a extensão dos braços e controle o movimento de descida até o peito.", wireframe: "chest" },
  { id: "ex_crucifixo_halteres", name: "Crucifixo Inclinado", muscle: "Peito", equipment: "Halteres, Banco Inclinado", difficulty: "Iniciante", desc: "Com banco inclinado a 30-45 graus, abra os braços lateralmente com leve flexão nos cotovelos e feche-os acima do peito.", wireframe: "chest" },
  { id: "ex_cross_over", name: "Crossover (Cabo)", muscle: "Peito", equipment: "Polia", difficulty: "Intermediário", desc: "Posicionado no meio da polia alta, traga os cabos para frente e para baixo unindo as mãos na linha da cintura.", wireframe: "chest" },
  // Costas
  { id: "ex_puxada_frente", name: "Puxada Aberta na Polia", muscle: "Costas", equipment: "Polia, Barra", difficulty: "Iniciante", desc: "Sentado no aparelho, puxe a barra em direção ao peitoral superior, contraindo as escápulas e mantendo a coluna ereta.", wireframe: "back" },
  { id: "ex_remada_curvada", name: "Remada Curvada com Barra", muscle: "Costas", equipment: "Barra", difficulty: "Avançado", desc: "Incline o tronco à frente a 45 graus, puxe a barra em direção ao abdômen mantendo as costas retas e cotovelos próximos ao corpo.", wireframe: "back" },
  { id: "ex_remada_serrote", name: "Remada Unilateral (Serrote)", muscle: "Costas", equipment: "Halter", difficulty: "Iniciante", desc: "Apoiado em um banco reto, puxe o halter verticalmente rente ao corpo focando no músculo dorsal.", wireframe: "back" },
  // Pernas
  { id: "ex_agachamento_livre", name: "Agachamento Livre com Barra", muscle: "Pernas", equipment: "Barra, Hack", difficulty: "Avançado", desc: "Com a barra nos ombros, flexione os joelhos jogando o quadril para trás como se fosse sentar, descendo até 90 graus.", wireframe: "legs" },
  { id: "ex_leg_press", name: "Leg Press 45°", muscle: "Pernas", equipment: "Máquina Leg Press", difficulty: "Iniciante", desc: "Sentado na máquina, empurre a plataforma com os pés afastados na largura dos ombros, evitando esticar totalmente os joelhos.", wireframe: "legs" },
  { id: "ex_cadeira_extensora", name: "Cadeira Extensora", muscle: "Pernas", equipment: "Cadeira Extensora", difficulty: "Iniciante", desc: "Sentado na máquina com o apoio nos tornozelos, estenda completamente as pernas contraindo o quadríceps.", wireframe: "legs" },
  // Ombros
  { id: "ex_desenvolvimento_halteres", name: "Desenvolvimento com Halteres", muscle: "Ombros", equipment: "Halteres, Banco", difficulty: "Intermediário", desc: "Sentado com encosto reto, empurre os halteres acima da cabeça partindo da linha das orelhas.", wireframe: "shoulders" },
  { id: "ex_elevacao_lateral", name: "Elevação Lateral", muscle: "Ombros", equipment: "Halteres", difficulty: "Iniciante", desc: "Em pé, eleve os braços lateralmente até a altura dos ombros, mantendo uma leve flexão nos cotovelos.", wireframe: "shoulders" },
  // Bíceps
  { id: "ex_rosca_direta", name: "Rosca Direta com Barra", muscle: "Bíceps", equipment: "Barra", difficulty: "Iniciante", desc: "Em pé, segure a barra com pegada supinada e flexione os cotovelos trazendo a barra até o peito sem mover os ombros.", wireframe: "biceps" },
  { id: "ex_rosca_martelo", name: "Rosca Martelo com Halteres", muscle: "Bíceps", equipment: "Halteres", difficulty: "Iniciante", desc: "Com pegada neutra (palmas voltadas para dentro), flexione os cotovelos trazendo os halteres para cima alternadamente.", wireframe: "biceps" },
  // Tríceps
  { id: "ex_tricep_pulley", name: "Tríceps Pulley (Corda)", muscle: "Tríceps", equipment: "Polia, Corda", difficulty: "Iniciante", desc: "Segurando a corda na polia alta, empurre as mãos para baixo abrindo as pontas da corda na extensão máxima.", wireframe: "triceps" },
  { id: "ex_tricep_frances", name: "Tríceps Francês Unilateral", muscle: "Tríceps", equipment: "Halter", difficulty: "Intermediário", desc: "Segure o halter atrás da cabeça flexionando o cotovelo e faça a extensão vertical total do braço.", wireframe: "triceps" },
  // Abdômen
  { id: "ex_infra_solo", name: "Abdominal Infra no Solo", muscle: "Abdômen", equipment: "Colchonete", difficulty: "Iniciante", desc: "Deitado, eleve as pernas estendidas até 90 graus e retorne lentamente sem encostar os pés no chão.", wireframe: "abs" },
  { id: "ex_prancha_isometrica", name: "Prancha Isométrica", muscle: "Abdômen", equipment: "Colchonete", difficulty: "Iniciante", desc: "Apoie os antebraços e pontas dos pés no solo, mantendo o corpo totalmente alinhado e o abdômen contraído.", wireframe: "abs" }
];

// 2. Global State Variables
let workouts = [];
let selectedWorkoutId = null;
let activeWorkout = null;
let currentExerciseIndex = 0;
let currentSetIndex = 0;
let voiceEnabled = false;
let recognition = null;
let geminiApiKey = "";

// Rest Timer Variables
let restTimerInterval = null;
let restTimeLeft = 0;
let restTotalDuration = 60;
let isRestTimerRunning = false;

// Voice vs TTS State Coordination
let wasListeningBeforeSpeaking = false;
let activeUtterance = null;

// Webcam Streams
let webcamStream = null;
let activeWebcamElement = null;
let activeCanvasElement = null;
let hudAnimationId = null;
let lastFpsUpdate = 0;
let framesCount = 0;
let currentFps = 30.0;

// Biometric Fake Data Generator states
let trackerPoints = [];

// 3. App Initialization
window.addEventListener('DOMContentLoaded', () => {
  // Load settings & keys
  geminiApiKey = localStorage.getItem('fithub_gemini_key') || "";
  document.getElementById('gemini-key-input').value = geminiApiKey;
  updateAiModeBadge();

  // Load custom speech rate
  const savedRate = localStorage.getItem('fithub_voice_rate');
  if (savedRate) {
    document.getElementById('voice-rate-input').value = savedRate;
  }

  // Load dashboard statistics
  loadStats();

  // Load workouts list or Seed default ones
  loadWorkouts();

  // Populate Exercise Library Tab
  renderLibrary();

  // Setup Voice Commands engine
  initVoiceCommands();

  // Initialize simulated tracker markers
  initTrackerPoints();

  // Render initial weekly chart
  renderWeeklyChart();

  // Print system message from ARES
  addAresChatMessage("Seja bem-vindo de volta, Rafael. Treinador A.R.E.S. pronto para orientar seu treino físico. Selecione uma Ficha de Treino e vamos começar a ajustar sua carga e sua técnica biomecânica.");
});

// 4. Local Storage Statistics & Settings
function loadStats() {
  const completedWorkouts = parseInt(localStorage.getItem('fithub_stat_completed_workouts') || '0');
  const completedSets = parseInt(localStorage.getItem('fithub_stat_completed_sets') || '0');
  const streak = parseInt(localStorage.getItem('fithub_stat_streak') || '0');
  const totalHours = parseFloat(localStorage.getItem('fithub_stat_hours') || '0.0');
  const totalVolume = parseInt(localStorage.getItem('fithub_stat_volume') || '0');

  document.getElementById('stat-completed-workouts').textContent = completedWorkouts;
  document.getElementById('stat-total-sets').textContent = completedSets;
  document.getElementById('stat-active-streak').textContent = `${streak} dias`;
  document.getElementById('dashboard-total-time').textContent = `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`;
  document.getElementById('dashboard-total-volume').textContent = `${totalVolume} kg`;
}

function saveStats(workoutDone, setsDone, volumeGained, hoursGained) {
  const completedWorkouts = parseInt(localStorage.getItem('fithub_stat_completed_workouts') || '0') + (workoutDone ? 1 : 0);
  const completedSets = parseInt(localStorage.getItem('fithub_stat_completed_sets') || '0') + setsDone;
  const totalVolume = parseInt(localStorage.getItem('fithub_stat_volume') || '0') + volumeGained;
  const totalHours = (parseFloat(localStorage.getItem('fithub_stat_hours') || '0.0') + hoursGained).toFixed(1);
  
  let streak = parseInt(localStorage.getItem('fithub_stat_streak') || '0');
  if (workoutDone) {
    streak += 1;
  }

  localStorage.setItem('fithub_stat_completed_workouts', completedWorkouts.toString());
  localStorage.setItem('fithub_stat_completed_sets', completedSets.toString());
  localStorage.setItem('fithub_stat_volume', totalVolume.toString());
  localStorage.setItem('fithub_stat_hours', totalHours.toString());
  localStorage.setItem('fithub_stat_streak', streak.toString());

  loadStats();
  renderWeeklyChart();
}

function saveGeminiKey() {
  const keyInput = document.getElementById('gemini-key-input').value.trim();
  localStorage.setItem('fithub_gemini_key', keyInput);
  geminiApiKey = keyInput;
  updateAiModeBadge();
  showToast("Chave API do Gemini Atualizada!");
}

function saveVoiceSettings() {
  const rateInput = document.getElementById('voice-rate-input').value;
  localStorage.setItem('fithub_voice_rate', rateInput);
}

function updateAiModeBadge() {
  const badge = document.getElementById('ai-mode-status');
  if (geminiApiKey) {
    badge.textContent = "IA GEMINI CONECTADA";
    badge.style.color = "var(--accent-orange)";
    document.getElementById('ai-chat-header-status').textContent = "A.R.E.S. COGNITIVO ATIVO";
    document.getElementById('ai-chat-header-status').style.color = "var(--accent-orange)";
  } else {
    badge.textContent = "LOCAL COACH";
    badge.style.color = "var(--text-muted)";
    document.getElementById('ai-chat-header-status').textContent = "A.R.E.S. COACH LOCAL";
    document.getElementById('ai-chat-header-status').style.color = "var(--text-muted)";
  }
}

// 5. Workouts CRUD (Fichas de Treino)
function loadWorkouts() {
  const stored = localStorage.getItem('fithub_workouts');
  if (stored) {
    workouts = JSON.parse(stored);
  } else {
    // Seed Workouts data if empty
    workouts = [
      {
        id: "w_treino_a",
        name: "Ficha A - Peito e Tríceps",
        desc: "Treino focado em empurrar - Hipertrofia do Peitoral e Tríceps",
        exercises: [
          { id: "ex_supino_reto", name: "Supino Reto com Barra", sets: 4, reps: "10-12", weight: 30, rest: 60 },
          { id: "ex_crucifixo_halteres", name: "Crucifixo Inclinado", sets: 3, reps: "12", weight: 14, rest: 60 },
          { id: "ex_tricep_pulley", name: "Tríceps Pulley (Corda)", sets: 4, reps: "12-15", weight: 20, rest: 45 }
        ]
      },
      {
        id: "w_treino_b",
        name: "Ficha B - Costas e Bíceps",
        desc: "Treino focado em puxar - Hipertrofia de Dorsais e Flexores do Cotovelo",
        exercises: [
          { id: "ex_puxada_frente", name: "Puxada Aberta na Polia", sets: 4, reps: "12", weight: 45, rest: 60 },
          { id: "ex_remada_serrote", name: "Remada Unilateral (Serrote)", sets: 3, reps: "10", weight: 18, rest: 60 },
          { id: "ex_rosca_direta", name: "Rosca Direta com Barra", sets: 4, reps: "10", weight: 12, rest: 60 }
        ]
      }
    ];
    saveWorkoutsToStorage();
  }
  renderWorkoutList();
}

function saveWorkoutsToStorage() {
  localStorage.setItem('fithub_workouts', JSON.stringify(workouts));
}

function renderWorkoutList() {
  const container = document.getElementById('workout-list-container');
  container.innerHTML = "";

  workouts.forEach(w => {
    const card = document.createElement('button');
    card.className = `workout-card-btn ${w.id === selectedWorkoutId ? 'active' : ''}`;
    card.id = `workout-card-${w.id}`;
    card.onclick = () => selectWorkout(w.id);

    card.innerHTML = `
      <div class="flex-column">
        <span class="workout-card-name">${w.name}</span>
        <span class="workout-card-desc">${w.desc}</span>
      </div>
      <span class="workout-card-badge">${w.exercises.length} Ex.</span>
    `;
    container.appendChild(card);
  });
}

function selectWorkout(id) {
  selectedWorkoutId = id;
  renderWorkoutList();

  const workout = workouts.find(w => w.id === id);
  const header = document.getElementById('workout-detail-header');
  const body = document.getElementById('workout-detail-body');
  const actionButtons = document.getElementById('workout-action-buttons');

  if (!workout) return;

  // Show action buttons
  actionButtons.style.display = "flex";
  
  // Set details view header name
  header.querySelector('h3').textContent = workout.name.toUpperCase();

  // Render Exercise lists
  if (workout.exercises.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <p>Esta ficha de treino não possui exercícios.</p>
        <button class="btn-neon" onclick="showAddExerciseModal()">+ ADICIONAR EXERCÍCIO</button>
      </div>
    `;
  } else {
    let rowsHtml = "";
    workout.exercises.forEach((ex, index) => {
      rowsHtml += `
        <tr>
          <td style="font-family:var(--font-title); color:var(--accent-orange);">${index + 1}</td>
          <td><strong>${ex.name}</strong></td>
          <td align="center">${ex.sets}</td>
          <td align="center">${ex.reps}</td>
          <td align="center">${ex.weight} kg</td>
          <td align="center">${ex.rest}s</td>
          <td align="right">
            <button class="btn-icon-danger" onclick="removeExerciseFromWorkout(${index})" title="Remover Exercício">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
            </button>
          </td>
        </tr>
      `;
    });

    body.innerHTML = `
      <div class="flex-column gap-15 height-100">
        <p class="panel-desc" style="margin-bottom:10px;">${workout.desc}</p>
        <div class="table-responsive flex-1" style="overflow-y:auto;">
          <table class="exercises-table">
            <thead>
              <tr>
                <th width="40">#</th>
                <th>Exercício</th>
                <th width="60" align="center">Séries</th>
                <th width="80" align="center">Reps</th>
                <th width="80" align="center">Carga</th>
                <th width="80" align="center">Descanso</th>
                <th width="60" align="right">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
        <div class="flex-row gap-10">
          <button class="btn-neon flex-1" onclick="showAddExerciseModal()">+ ADICIONAR EXERCÍCIO</button>
        </div>
      </div>
    `;
  }

  // Update dashboard quick action workout name
  document.getElementById('active-workout-name').textContent = workout.name;
}

function showCreateWorkoutModal() {
  document.getElementById('create-workout-modal').style.display = "flex";
  document.getElementById('workout-name-input').focus();
}

function hideCreateWorkoutModal() {
  document.getElementById('create-workout-modal').style.display = "none";
  document.getElementById('workout-name-input').value = "";
  document.getElementById('workout-desc-input').value = "";
}

function createNewWorkout() {
  const name = document.getElementById('workout-name-input').value.trim();
  const desc = document.getElementById('workout-desc-input').value.trim();

  if (!name) {
    showToast("Nome do treino é obrigatório!");
    return;
  }

  const newWorkout = {
    id: "w_" + Date.now(),
    name: name,
    desc: desc || "Treinamento Personalizado",
    exercises: []
  };

  workouts.push(newWorkout);
  saveWorkoutsToStorage();
  renderWorkoutList();
  selectWorkout(newWorkout.id);
  hideCreateWorkoutModal();
  showToast("Nova ficha de treino criada!");

  speakVoiceResponse(`Nova ficha de treino, ${name}, foi criada com sucesso.`);
}

function deleteSelectedWorkout() {
  if (!selectedWorkoutId) return;
  const idx = workouts.findIndex(w => w.id === selectedWorkoutId);
  if (idx === -1) return;

  if (confirm(`Deseja realmente excluir a ficha "${workouts[idx].name}"?`)) {
    speakVoiceResponse(`Excluindo ficha de treino ${workouts[idx].name}.`);
    workouts.splice(idx, 1);
    saveWorkoutsToStorage();
    selectedWorkoutId = null;
    renderWorkoutList();

    // Reset details view
    document.getElementById('workout-detail-header').querySelector('h3').textContent = "DETALHES DO TREINO";
    document.getElementById('workout-action-buttons').style.display = "none";
    document.getElementById('workout-detail-body').innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="50" class="neon-svg"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/></svg>
        <p>Selecione um treino na barra lateral ou crie um novo para gerenciar seus exercícios.</p>
      </div>
    `;

    document.getElementById('active-workout-name').textContent = "Sem Ficha Ativa";
    showToast("Ficha de treino excluída.");
  }
}

// 6. Exercises Modal Management
let selectedExerciseIdForWorkout = null;

function showAddExerciseModal() {
  if (!selectedWorkoutId) return;
  document.getElementById('add-exercise-modal').style.display = "flex";
  
  // Render exercises list in modal
  const container = document.getElementById('modal-exercise-list-container');
  container.innerHTML = "";

  DEFAULT_EXERCISES.forEach(ex => {
    const item = document.createElement('div');
    item.className = "modal-exercise-item";
    item.id = `modal-ex-item-${ex.id}`;
    item.onclick = () => selectExerciseInModal(ex.id);
    item.innerHTML = `
      <span>${ex.name}</span>
      <span class="modal-ex-muscle">${ex.muscle}</span>
    `;
    container.appendChild(item);
  });

  selectedExerciseIdForWorkout = null;
}

function hideAddExerciseModal() {
  document.getElementById('add-exercise-modal').style.display = "none";
}

function selectExerciseInModal(id) {
  selectedExerciseIdForWorkout = id;
  document.querySelectorAll('.modal-exercise-item').forEach(el => el.classList.remove('selected'));
  document.getElementById(`modal-ex-item-${id}`).classList.add('selected');
}

function filterModalExercises() {
  const query = document.getElementById('modal-search-exercise').value.toLowerCase();
  const items = document.querySelectorAll('.modal-exercise-item');

  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes(query)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

function confirmAddExerciseToWorkout() {
  if (!selectedExerciseIdForWorkout) {
    showToast("Por favor, selecione um exercício da lista.");
    return;
  }

  const sets = parseInt(document.getElementById('exercise-sets-input').value) || 4;
  const reps = document.getElementById('exercise-reps-input').value.trim() || "12";
  const weight = parseInt(document.getElementById('exercise-weight-input').value) || 10;
  const rest = parseInt(document.getElementById('exercise-rest-input').value) || 60;

  const workout = workouts.find(w => w.id === selectedWorkoutId);
  const exerciseBase = DEFAULT_EXERCISES.find(ex => ex.id === selectedExerciseIdForWorkout);

  if (!workout || !exerciseBase) return;

  const newExercise = {
    id: exerciseBase.id,
    name: exerciseBase.name,
    sets: sets,
    reps: reps,
    weight: weight,
    rest: rest
  };

  workout.exercises.push(newExercise);
  saveWorkoutsToStorage();
  selectWorkout(selectedWorkoutId);
  hideAddExerciseModal();
  showToast("Exercício adicionado!");

  speakVoiceResponse(`${exerciseBase.name} adicionado ao treino.`);
}

function removeExerciseFromWorkout(index) {
  const workout = workouts.find(w => w.id === selectedWorkoutId);
  if (!workout) return;

  const removedName = workout.exercises[index].name;
  workout.exercises.splice(index, 1);
  saveWorkoutsToStorage();
  selectWorkout(selectedWorkoutId);
  showToast("Exercício removido.");
  speakVoiceResponse(`${removedName} removido do treino.`);
}

// 7. Exercise Library Rendering (Biblioteca Tab)
function renderLibrary() {
  const container = document.getElementById('exercises-grid-container');
  container.innerHTML = "";

  document.getElementById('library-count').textContent = DEFAULT_EXERCISES.length;

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

function drawWireframeSvg(canvasId, type) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.strokeStyle = "rgba(255, 82, 0, 0.2)";
  ctx.lineWidth = 1;

  const w = canvas.width;
  const h = canvas.height;

  // Grid background
  ctx.beginPath();
  for (let x = 0; x < w; x += 15) {
    ctx.moveTo(x, 0); ctx.lineTo(x, h);
  }
  for (let y = 0; y < h; y += 15) {
    ctx.moveTo(0, y); ctx.lineTo(w, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "var(--accent-orange)";
  ctx.lineWidth = 2;
  ctx.beginPath();

  if (type === 'chest') {
    ctx.arc(w/2, h/2 - 10, 14, 0, Math.PI * 2); // head
    ctx.moveTo(w/2, h/2 + 4); ctx.lineTo(w/2, h/2 + 30); // body
    ctx.moveTo(w/2 - 22, h/2 - 4); ctx.lineTo(w/2 + 22, h/2 - 4); // shoulders
    ctx.moveTo(w/2 - 22, h/2 - 4); ctx.lineTo(w/2 - 22, h/2 + 18);
    ctx.moveTo(w/2 + 22, h/2 - 4); ctx.lineTo(w/2 + 22, h/2 + 18);
    ctx.moveTo(w/2 - 38, h/2 + 30); ctx.lineTo(w/2 + 38, h/2 + 30); // bench
  } else if (type === 'biceps' || type === 'triceps') {
    ctx.arc(w/2, h/2 - 18, 12, 0, Math.PI * 2);
    ctx.moveTo(w/2, h/2 - 6); ctx.lineTo(w/2, h/2 + 25);
    ctx.moveTo(w/2, h/2 - 1); ctx.lineTo(w/2 - 18, h/2 + 10);
    ctx.lineTo(w/2 - 5, h/2 + 22);
    ctx.arc(w/2 - 5, h/2 + 22, 5, 0, Math.PI * 2);
  } else if (type === 'legs') {
    ctx.arc(w/2, h/2 - 22, 11, 0, Math.PI * 2);
    ctx.moveTo(w/2, h/2 - 11); ctx.lineTo(w/2, h/2 + 12);
    ctx.moveTo(w/2, h/2 + 12); ctx.lineTo(w/2 - 12, h/2 + 22);
    ctx.lineTo(w/2 - 4, h/2 + 40);
    ctx.moveTo(w/2 - 25, h/2 + 40); ctx.lineTo(w/2 + 25, h/2 + 40); // floor
  } else {
    ctx.moveTo(w/2 - 25, h/2); ctx.lineTo(w/2 + 25, h/2);
    ctx.moveTo(w/2, h/2 - 25); ctx.lineTo(w/2, h/2 + 25);
    ctx.arc(w/2, h/2, 8, 0, Math.PI * 2);
  }
  ctx.stroke();
}

function filterLibrary(muscle) {
  document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
  
  if (muscle === 'all') {
    document.getElementById('btn-filter-all').classList.add('active');
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
    document.getElementById(idMap[muscle]).classList.add('active');
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

  document.getElementById('library-count').textContent = visibleCount;
}

function searchLibrary() {
  const query = document.getElementById('search-exercise-input').value.toLowerCase();
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

  document.getElementById('library-count').textContent = visibleCount;
}

// 8. Tab Switching System
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

  document.getElementById(`content-${tabId}`).classList.add('active');
  document.getElementById(`tab-btn-${tabId}`).classList.add('active');

  if (tabId === 'library') {
    renderLibrary();
  } else if (tabId === 'dashboard') {
    renderWeeklyChart();
  }

  if (tabId === 'camera') {
    activeWebcamElement = document.getElementById('tab-webcam');
    activeCanvasElement = document.getElementById('tab-cam-overlay');
  } else {
    if (!activeWorkout && webcamStream) {
      stopWebcam();
    }
  }
}

// 9. Audio Synth Engine (Web Audio API Sound Effects)
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
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
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

// 10. Voice Control (Speech Recognition & TTS)
function initVoiceCommands() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('mic-status-text').textContent = "INCOMPATÍVEL";
    document.getElementById('mic-status-dot').className = "hud-stat-dot red";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onstart = () => {
    voiceEnabled = true;
    document.getElementById('mic-status-text').textContent = "OUVINDO";
    document.getElementById('mic-status-dot').className = "hud-stat-dot green blinking";
    
    document.getElementById('btn-toggle-mic').classList.add('active-listening');
    document.getElementById('chat-btn-mic').classList.add('active-listening');
    
    document.getElementById('voice-sound-wave').classList.add('active');
    showToast("Comandos de voz ativos!");
  };

  recognition.onend = () => {
    voiceEnabled = false;
    document.getElementById('mic-status-text').textContent = "DESATIVADO";
    document.getElementById('mic-status-dot').className = "hud-stat-dot red";
    
    document.getElementById('btn-toggle-mic').classList.remove('active-listening');
    document.getElementById('chat-btn-mic').classList.remove('active-listening');
    
    document.getElementById('voice-sound-wave').classList.remove('active');
  };

  recognition.onerror = (e) => {
    console.error("Speech Recognition Error", e);
    // Restart only if we didn't intentionally stop
    if (voiceEnabled && !wasListeningBeforeSpeaking) {
      try {
        recognition.start();
      } catch (err) { console.error(err); }
    }
  };

  recognition.onresult = (event) => {
    const resultIdx = event.resultIndex;
    const transcript = event.results[resultIdx][0].transcript.trim().toLowerCase();
    
    console.log(`Voice Command: "${transcript}"`);
    handleVoiceCommand(transcript);
  };
}

function toggleVoiceRecognition() {
  if (!recognition) {
    showToast("Reconhecimento de voz não suportado.");
    return;
  }

  if (voiceEnabled) {
    stopVoiceRecognition();
  } else {
    try {
      wasListeningBeforeSpeaking = false;
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  }
}

function stopVoiceRecognition() {
  if (recognition && voiceEnabled) {
    recognition.stop();
  }
}

function handleVoiceCommand(command) {
  addUserChatMessage(command);

  if (command.includes("iniciar treino") || command.includes("começar treino")) {
    if (selectedWorkoutId) {
      startActiveWorkout();
    } else {
      speakVoiceResponse("Rafael, selecione uma ficha de treino primeiro.");
    }
  } 
  else if (command.includes("concluir") || command.includes("série concluída") || command.includes("concluir série")) {
    if (activeWorkout) {
      completeActiveSet();
    } else {
      speakVoiceResponse("Não há treino em execução no momento.");
    }
  } 
  else if (command.includes("pular") || command.includes("pular descanso")) {
    if (activeWorkout && isRestTimerRunning) {
      skipRestTimer();
    } else {
      speakVoiceResponse("O cronômetro de descanso não está ativo.");
    }
  } 
  else if (command.includes("status") || command.includes("relatório")) {
    if (activeWorkout) {
      const workout = workouts.find(w => w.id === activeWorkout.id);
      const ex = workout.exercises[currentExerciseIndex];
      speakVoiceResponse(`Estamos no exercício ${ex.name}. Série ${currentSetIndex + 1} de ${ex.sets}.`);
    } else {
      speakVoiceResponse("Nenhum treino ativo. Pronto para começar a treinar.");
    }
  } 
  else {
    getAiResponse(command);
  }
}

function speakVoiceResponse(text) {
  if (!('speechSynthesis' in window)) return;

  // 1. Temporarily halt recognition to prevent hearing itself
  if (voiceEnabled && recognition) {
    wasListeningBeforeSpeaking = true;
    recognition.stop();
  } else {
    wasListeningBeforeSpeaking = false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance; // Keep reference to prevent garbage collection onend bug
  utterance.lang = 'pt-BR';
  
  const customRate = parseFloat(localStorage.getItem('fithub_voice_rate') || '1.0');
  utterance.rate = customRate;

  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  const avatar = document.getElementById('ai-avatar-pulse');
  if (avatar) avatar.classList.add('talking');
  
  // Coordinator callbacks to resume recognition when speech ends
  const resumeRecognition = () => {
    if (avatar) avatar.classList.remove('talking');
    if (wasListeningBeforeSpeaking && recognition) {
      wasListeningBeforeSpeaking = false;
      try {
        recognition.start();
      } catch (err) {
        console.error("Error restarting voice recognition:", err);
      }
    }
  };

  utterance.onend = resumeRecognition;
  utterance.onerror = (e) => {
    console.error("Speech Synthesis Error:", e);
    resumeRecognition();
  };

  window.speechSynthesis.speak(utterance);
}

function testVoiceSynthesis() {
  speakVoiceResponse("Calibração de áudio efetuada. Pronto para monitorar sua carga e técnica biomecânica.");
  showToast("Áudio de teste executado!");
}

// 11. AI Cognitive Engine (Gemini API Integration + Offline Router)
async function getAiResponse(userMessage) {
  const msgBox = addAresChatMessage("Processando resposta do treinador...");
  
  // High-performance personal trainer prompt focusing on gym/biomechanics tips
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
      replyText = getLocalFallbackResponse(userMessage) + " (Nota: Erro de conexão com API do Gemini. Usando banco local).";
    }
  } else {
    replyText = getLocalFallbackResponse(userMessage);
  }

  msgBox.innerHTML = `"${replyText}"`;
  speakVoiceResponse(replyText);
  document.getElementById('ai-quick-response').textContent = `"${replyText}"`;
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

// Dynamic fallback gym tips pool to rotate and make offline local coach feel alive and non-repetitive
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

function getLocalFallbackResponse(msg) {
  // Normalize string: remove accents and special chars to make matching robust
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

  // Rotate fallback tips to prevent repetition
  const tip = FALLBACK_TIPS[fallbackTipIndex];
  fallbackTipIndex = (fallbackTipIndex + 1) % FALLBACK_TIPS.length;
  return tip;
}

// Visual chat logs rendering
function addUserChatMessage(text) {
  const container = document.getElementById('chat-messages-container');
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
  const txt = input.value.trim();
  if (!txt) return;

  addUserChatMessage(txt);
  input.value = "";
  getAiResponse(txt);
}

// 12. Webcam HUD Animators & Snapshots (Camera Módulo)
function toggleWebcam() {
  if (webcamStream) {
    stopWebcam();
    showToast("Câmera desativada.");
  } else {
    navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 } 
    })
    .then(stream => {
      webcamStream = stream;
      
      if (activeWebcamElement) {
        activeWebcamElement.srcObject = stream;
        activeWebcamElement.style.display = "block";
      }

      const fallback = activeWorkout ? 'exec-cam-fallback' : 'tab-cam-fallback';
      const fallbackEl = document.getElementById(fallback);
      if (fallbackEl) fallbackEl.style.display = "none";

      if (!activeWorkout) {
        document.getElementById('tab-hud-layer').style.display = "block";
        document.getElementById('camera-hud-badge').textContent = "HUD ATIVO";
        document.getElementById('btn-capture-snapshot').removeAttribute('disabled');
      }

      startHudAnimation();
      showToast("Câmera de treino ativada!");
      speakVoiceResponse("Câmera ativada. Iniciando monitoramento de alinhamento postural.");
    })
    .catch(err => {
      console.error("Webcam Error", err);
      showToast("Erro ao acessar câmera: " + err.message);
    });
  }
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
  }
  
  if (activeWebcamElement) {
    activeWebcamElement.srcObject = null;
    activeWebcamElement.style.display = "none";
  }

  const fallback = activeWorkout ? 'exec-cam-fallback' : 'tab-cam-fallback';
  const fallbackEl = document.getElementById(fallback);
  if (fallbackEl) fallbackEl.style.display = "flex";

  if (!activeWorkout) {
    document.getElementById('tab-hud-layer').style.display = "none";
    document.getElementById('camera-hud-badge').textContent = "HUD OFFLINE";
    document.getElementById('btn-capture-snapshot').setAttribute('disabled', 'true');
  }

  if (hudAnimationId) {
    cancelAnimationFrame(hudAnimationId);
    hudAnimationId = null;
  }

  if (activeCanvasElement) {
    const ctx = activeCanvasElement.getContext('2d');
    ctx.clearRect(0, 0, activeCanvasElement.width, activeCanvasElement.height);
  }
}

function startHudAnimation() {
  if (hudAnimationId) cancelAnimationFrame(hudAnimationId);

  if (activeCanvasElement && activeWebcamElement) {
    activeCanvasElement.width = activeCanvasElement.offsetWidth;
    activeCanvasElement.height = activeCanvasElement.offsetHeight;
  }

  lastFpsUpdate = performance.now();
  framesCount = 0;

  function loop(time) {
    if (!webcamStream) return;
    
    renderHudOverlay();

    framesCount++;
    if (time > lastFpsUpdate + 1000) {
      currentFps = ((framesCount * 1000) / (time - lastFpsUpdate)).toFixed(1);
      framesCount = 0;
      lastFpsUpdate = time;

      const fpsEl = document.getElementById('hud-fps-val');
      if (fpsEl) fpsEl.textContent = currentFps;
    }

    hudAnimationId = requestAnimationFrame(loop);
  }

  hudAnimationId = requestAnimationFrame(loop);
}

function initTrackerPoints() {
  trackerPoints = [];
  for (let i = 0; i < 6; i++) {
    trackerPoints.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.004,
      vy: (Math.random() - 0.5) * 0.004,
      label: ["Cabeça", "Ombro", "Cotovelo", "Pulso", "Quadril", "Joelho"][i]
    });
  }
}

function renderHudOverlay() {
  if (!activeCanvasElement || !activeWebcamElement) return;
  
  const canvas = activeCanvasElement;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Mesh lines connecting joints
  ctx.strokeStyle = "rgba(255, 82, 0, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  
  trackerPoints.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0.15 || p.x > 0.85) p.vx *= -1;
    if (p.y < 0.15 || p.y > 0.85) p.vy *= -1;

    const px = p.x * w;
    const py = p.y * h;

    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Joint nodes
  trackerPoints.forEach(p => {
    const px = p.x * w;
    const py = p.y * h;

    ctx.strokeStyle = "var(--accent-orange)";
    ctx.strokeRect(px - 5, py - 5, 10, 10);
    
    ctx.fillStyle = "var(--accent-orange)";
    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "11px Outfit";
    ctx.fillText(p.label, px + 8, py + 3);
  });

  const sinShift = Math.sin(performance.now() * 0.0018);
  const fakeAngle = Math.round(85 + sinShift * 45);
  const fakeExt = Math.round(50 + sinShift * 50);

  const angEl = document.getElementById('hud-ang-val');
  if (angEl) angEl.textContent = `${fakeAngle}°`;

  const extEl = document.getElementById('hud-ext-val');
  if (extEl) extEl.textContent = `${fakeExt}%`;

  const paceEl = document.getElementById('hud-pace-val');
  if (paceEl) paceEl.textContent = (sinShift > 0) ? "EXCÊNTRICA" : "CONCÊNTRICA";
  
  if (!activeWorkout) {
    ctx.strokeStyle = "var(--accent-orange)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(60, h - 60, 26, -Math.PI/2, (-Math.PI/2) + (Math.PI * 2 * (fakeAngle/180)));
    ctx.stroke();
    
    ctx.fillStyle = "#fff";
    ctx.font = "12px Outfit";
    ctx.fillText(`${fakeAngle}°`, 45, h - 56);
  }
}

function takeSnapshot() {
  if (!webcamStream || !activeWebcamElement) return;

  const video = activeWebcamElement;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const base64Img = canvas.toDataURL('image/jpeg');
  
  let snaps = JSON.parse(localStorage.getItem('fithub_snapshots') || '[]');
  snaps.unshift({
    id: Date.now(),
    date: new Date().toLocaleDateString('pt-BR') + ' - ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
    image: base64Img
  });

  if (snaps.length > 10) snaps.pop();
  
  localStorage.setItem('fithub_snapshots', JSON.stringify(snaps));
  renderSnapshotsGallery();
  showToast("Foto de progresso salva!");
  playSynthesizedSound('success');
}

function renderSnapshotsGallery() {
  const container = document.getElementById('snapshots-gallery-container');
  const emptyState = document.getElementById('gallery-empty-state');
  
  const snaps = JSON.parse(localStorage.getItem('fithub_snapshots') || '[]');

  if (snaps.length === 0) {
    emptyState.style.display = "block";
    document.querySelectorAll('.snapshot-item').forEach(el => el.remove());
    return;
  }

  emptyState.style.display = "none";
  document.querySelectorAll('.snapshot-item').forEach(el => el.remove());

  snaps.forEach(snap => {
    const item = document.createElement('div');
    item.className = "snapshot-item";
    item.onclick = () => showLargeSnapshot(snap.image);
    item.innerHTML = `
      <img src="${snap.image}" alt="Progresso">
      <div class="snapshot-meta">
        <span>${snap.date}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function showLargeSnapshot(imageStr) {
  const overlay = document.createElement('div');
  overlay.className = "modal-overlay";
  overlay.onclick = () => overlay.remove();
  overlay.innerHTML = `
    <div class="modal-content glass-panel" style="width: auto; max-width: 90vw;">
      <div class="modal-header">
        <h3>REVISÃO DE PROGRESSO FÍSICO</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body" style="padding: 10px;">
        <img src="${imageStr}" style="width:100%; border-radius:6px; max-height: 80vh; object-fit: contain;">
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

// 13. Workout Execution & Rest Timer (Execução do Treino)
function quickStartWorkout() {
  if (workouts.length === 0) {
    showToast("Crie uma ficha de treino primeiro!");
    switchTab('workouts');
    return;
  }
  
  if (!selectedWorkoutId) {
    selectedWorkoutId = workouts[0].id;
  }
  
  startActiveWorkout();
}

function startActiveWorkout() {
  const workout = workouts.find(w => w.id === selectedWorkoutId);
  if (!workout) return;

  if (workout.exercises.length === 0) {
    showToast("Adicione exercícios a esta ficha antes de treinar.");
    switchTab('workouts');
    return;
  }

  activeWorkout = {
    id: workout.id,
    name: workout.name,
    exercises: JSON.parse(JSON.stringify(workout.exercises)),
    completedSetsCount: 0,
    startTime: Date.now()
  };

  currentExerciseIndex = 0;
  currentSetIndex = 0;

  document.getElementById('workout-execution-overlay').style.display = "flex";
  document.getElementById('executing-workout-name').textContent = activeWorkout.name.toUpperCase();

  activeWebcamElement = document.getElementById('exec-webcam');
  activeCanvasElement = document.getElementById('exec-cam-overlay');
  
  if (webcamStream) {
    stopWebcam();
  }
  toggleWebcam();

  renderActiveExercise();

  playSynthesizedSound('success');
  showToast("Ficha Ativada!");

  speakVoiceResponse(`Iniciando treino ${activeWorkout.name}. Primeiro exercício: ${activeWorkout.exercises[0].name}. Prepare a carga de ${activeWorkout.exercises[0].weight} quilos.`);
  
  document.getElementById('hud-workouts-today').textContent = "1";
}

function renderActiveExercise() {
  if (!activeWorkout) return;
  const ex = activeWorkout.exercises[currentExerciseIndex];

  document.getElementById('exec-exercise-name').textContent = ex.name.toUpperCase();
  document.getElementById('exec-exercise-index').textContent = `Exercício ${currentExerciseIndex + 1} de ${activeWorkout.exercises.length}`;

  const container = document.getElementById('exec-series-list-container');
  container.innerHTML = "";

  for (let s = 0; s < ex.sets; s++) {
    const isCompleted = s < currentSetIndex;
    const isActive = s === currentSetIndex;

    const row = document.createElement('div');
    row.className = `exec-series-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    
    row.innerHTML = `
      <span class="exec-series-num">SÉRIE ${s + 1}</span>
      <div class="exec-series-input-group">
        <span>Carga:</span>
        <input type="number" class="exec-series-input" id="set-weight-${s}" value="${ex.weight}" ${isCompleted ? 'disabled' : ''}>
        <span>kg</span>
        <span>Reps:</span>
        <input type="text" class="exec-series-input" id="set-reps-${s}" value="${ex.reps}" ${isCompleted ? 'disabled' : ''}>
      </div>
      <button class="btn-check-set" onclick="completeSetAt(${s})" ${isCompleted ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" width="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
      </button>
    `;
    container.appendChild(row);
  }

  document.getElementById('exec-form-confidence').textContent = `ESTABILIDADE FORM: 95%`;

  document.getElementById('exec-waveform').classList.add('active');
  const coachTexts = [
    `Foque na execução do ${ex.name}. Movimento firme e amplitude máxima.`,
    `Carga de ${ex.weight}kg. Controle a fase excêntrica para otimizar os ganhos.`,
    `A.R.E.S. detectando postura alinhada. Concentre-se nas últimas repetições.`
  ];
  const advice = coachTexts[currentExerciseIndex % coachTexts.length];
  document.getElementById('exec-coach-bubble-text').textContent = `"${advice}"`;
}

function completeSetAt(setIdx) {
  if (!activeWorkout) return;
  const ex = activeWorkout.exercises[currentExerciseIndex];

  // Capture inputs
  const weightVal = parseInt(document.getElementById(`set-weight-${setIdx}`).value) || ex.weight;
  const repsVal = document.getElementById(`set-reps-${setIdx}`).value;

  // Salva os valores digitados no estado do exercício ativo
  ex.weight = weightVal;
  ex.reps = repsVal;

  activeWorkout.completedSetsCount++;
  currentSetIndex = setIdx + 1;

  if (currentSetIndex >= ex.sets) {
    showToast(`Exercício "${ex.name}" Concluído!`);
    playSynthesizedSound('success');

    if (currentExerciseIndex >= activeWorkout.exercises.length - 1) {
      // Última série do último exercício concluída!
      speakVoiceResponse(`Excelente trabalho, Rafael! Você concluiu todos os exercícios do treino ${activeWorkout.name}. Salvando seus resultados agora.`);
      renderActiveExercise();
      setTimeout(() => {
        finishWorkout();
      }, 1500);
      return;
    } else {
      speakVoiceResponse(`Exercício concluído! Excelente trabalho no ${ex.name}. Descanso de ${ex.rest} segundos iniciado.`);
      startRestTimer(ex.rest);
    }
  } else {
    playSynthesizedSound('beep');
    speakVoiceResponse(`Série número ${setIdx + 1} concluída. Descanse por ${ex.rest} segundos.`);
    startRestTimer(ex.rest);
  }

  renderActiveExercise();
}

function completeActiveSet() {
  if (currentSetIndex < activeWorkout.exercises[currentExerciseIndex].sets) {
    completeSetAt(currentSetIndex);
  } else {
    speakVoiceResponse("Exercício concluído, Rafael. Avance para o próximo exercício.");
  }
}

function nextExercise() {
  if (!activeWorkout) return;
  
  if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
    currentExerciseIndex++;
    currentSetIndex = 0;
    renderActiveExercise();
    
    const nextEx = activeWorkout.exercises[currentExerciseIndex];
    speakVoiceResponse(`Próximo exercício: ${nextEx.name}. Carga sugerida: ${nextEx.weight} quilos.`);
  } else {
    // Finaliza automaticamente o treino ao avançar no último exercício
    speakVoiceResponse("Ficha de treino concluída. Salvando seus resultados.");
    finishWorkout();
  }
}

function prevExercise() {
  if (!activeWorkout) return;

  if (currentExerciseIndex > 0) {
    currentExerciseIndex--;
    currentSetIndex = 0;
    renderActiveExercise();
    
    const prevEx = activeWorkout.exercises[currentExerciseIndex];
    speakVoiceResponse(`Retornando para ${prevEx.name}.`);
  }
}

// 14. Rest Timer Controller
function startRestTimer(seconds) {
  stopRestTimer();
  
  restTimeLeft = seconds;
  restTotalDuration = seconds;
  isRestTimerRunning = true;

  document.getElementById('timer-status-label').textContent = "DESCANSO";
  document.getElementById('timer-status-label').style.color = "var(--accent-orange)";
  document.getElementById('btn-timer-toggle').textContent = "PAUSAR DESCANSO";
  document.getElementById('btn-timer-toggle').className = "btn-neon red-glow";

  updateTimerDisplay();

  restTimerInterval = setInterval(() => {
    restTimeLeft--;
    updateTimerDisplay();

    if (restTimeLeft <= 0) {
      stopRestTimer();
      playSynthesizedSound('alarm');
      speakVoiceResponse("Descanso encerrado Rafael. Inicie a próxima série!");
      showToast("Descanso finalizado!");
    } else if (restTimeLeft === 5) {
      playSynthesizedSound('beep');
    }
  }, 1000);
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  display.textContent = restTimeLeft.toString().padStart(2, '0');

  const progressRing = document.getElementById('timer-progress-ring');
  const offset = 283 - (restTimeLeft / restTotalDuration) * 283;
  progressRing.style.strokeDashoffset = offset;
}

function toggleRestTimer() {
  if (isRestTimerRunning) {
    clearInterval(restTimerInterval);
    isRestTimerRunning = false;
    document.getElementById('timer-status-label').textContent = "PAUSADO";
    document.getElementById('btn-timer-toggle').textContent = "RETOMAR";
    document.getElementById('btn-timer-toggle').className = "btn-neon green-glow";
  } else {
    if (restTimeLeft <= 0) {
      const ex = activeWorkout.exercises[currentExerciseIndex];
      startRestTimer(ex.rest);
    } else {
      startRestTimer(restTimeLeft);
    }
  }
}

function adjustRestTime(amount) {
  if (!activeWorkout) return;
  restTimeLeft = Math.max(0, restTimeLeft + amount);
  restTotalDuration = Math.max(restTotalDuration, restTimeLeft);
  updateTimerDisplay();
}

function skipRestTimer() {
  stopRestTimer();
  playSynthesizedSound('beep');
  speakVoiceResponse("Descanso pulado. Inicie a série.");
}

function stopRestTimer() {
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
  isRestTimerRunning = false;
  restTimeLeft = 0;
  
  const display = document.getElementById('timer-display');
  if (display) display.textContent = "00";
  
  const progressRing = document.getElementById('timer-progress-ring');
  if (progressRing) progressRing.style.strokeDashoffset = 283;

  const btn = document.getElementById('btn-timer-toggle');
  if (btn) {
    btn.textContent = "INICIAR DESCANSO";
    btn.className = "btn-neon green-glow";
  }

  const lbl = document.getElementById('timer-status-label');
  if (lbl) {
    lbl.textContent = "STANDBY";
    lbl.style.color = "var(--text-muted)";
  }
}

function finishWorkout() {
  if (!activeWorkout) return;

  const durationMs = Date.now() - activeWorkout.startTime;
  const durationHours = durationMs / (1000 * 60 * 60);

  let volumeGained = 0;
  activeWorkout.exercises.forEach(ex => {
    let repsNum = parseInt(ex.reps) || 10;
    volumeGained += ex.weight * ex.sets * repsNum;
  });

  saveStats(true, activeWorkout.completedSetsCount, volumeGained, durationHours);
  stopWebcam();

  document.getElementById('workout-execution-overlay').style.display = "none";
  activeWorkout = null;

  playSynthesizedSound('success');
  showToast("Treino registrado com sucesso!");

  speakVoiceResponse("Treino finalizado, Rafael! Registrei o volume acumulado e o tempo total de estímulo no histórico. Continue firme.");
}

// 15. Dynamic Chart Rendering (Dashboard Tab)
function renderWeeklyChart() {
  const barsContainer = document.getElementById('chart-bars');
  if (!barsContainer) return;
  barsContainer.innerHTML = "";

  const weekVolumeData = [
    { day: "Seg", vol: 2400 },
    { day: "Ter", vol: 1800 },
    { day: "Qua", vol: 2800 },
    { day: "Qui", vol: 0 },
    { day: "Sex", vol: 3200 },
    { day: "Sáb", vol: 1500 },
    { day: "Dom", vol: 0 }
  ];

  const todayIndex = (new Date().getDay() + 6) % 7;
  const totalVolume = parseInt(localStorage.getItem('fithub_stat_volume') || '0');
  
  if (totalVolume > 0) {
    weekVolumeData[todayIndex].vol = Math.min(4000, 1000 + (totalVolume % 3000));
  }

  const maxVal = Math.max(...weekVolumeData.map(d => d.vol), 3000);

  weekVolumeData.forEach((d, idx) => {
    const barHeightPct = (d.vol / maxVal) * 90;
    const bar = document.createElement('div');
    bar.className = "chart-bar";
    bar.style.height = "0%";
    bar.setAttribute('data-weight', `${d.vol}kg`);
    
    setTimeout(() => {
      bar.style.height = `${barHeightPct}%`;
    }, 100 * idx);

    barsContainer.appendChild(bar);
  });
}

// 16. Utility Helpers
function showToast(message) {
  const toast = document.getElementById('notification-toast');
  const msg = document.getElementById('notification-message');
  
  msg.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}
