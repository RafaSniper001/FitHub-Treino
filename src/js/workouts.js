// FitHub Treino - Módulo de Treinos e Fichas (workouts.js)

const DEFAULT_EXERCISES = [
  { id: "ex_supino_reto", name: "Supino Reto com Barra", muscle: "Peito", equipment: "Barra, Banco", difficulty: "Intermediário", desc: "Deitado no banco reto, empurre a barra verticalmente até a extensão dos braços e controle o movimento de descida até o peito.", wireframe: "chest" },
  { id: "ex_crucifixo_halteres", name: "Crucifixo Inclinado", muscle: "Peito", equipment: "Halteres, Banco Inclinado", difficulty: "Iniciante", desc: "Com banco inclinado a 30-45 graus, abra os braços lateralmente com leve flexão nos cotovelos e feche-os acima do peito.", wireframe: "chest" },
  { id: "ex_cross_over", name: "Crossover (Cabo)", muscle: "Peito", equipment: "Polia", difficulty: "Intermediário", desc: "Posicionado no meio da polia alta, traga os cabos para frente e para baixo unindo as mãos na linha da cintura.", wireframe: "chest" },
  { id: "ex_puxada_frente", name: "Puxada Aberta na Polia", muscle: "Costas", equipment: "Polia, Barra", difficulty: "Iniciante", desc: "Sentado no aparelho, puxe a barra em direção ao peitoral superior, contraindo as escápulas e mantendo a coluna ereta.", wireframe: "back" },
  { id: "ex_remada_curvada", name: "Remada Curvada com Barra", muscle: "Costas", equipment: "Barra", difficulty: "Avançado", desc: "Incline o tronco à frente a 45 graus, puxe a barra em direção ao abdômen mantendo as costas retas e cotovelos próximos ao corpo.", wireframe: "back" },
  { id: "ex_remada_serrote", name: "Remada Unilateral (Serrote)", muscle: "Costas", equipment: "Halter", difficulty: "Iniciante", desc: "Apoiado em um banco reto, puxe o halter verticalmente rente ao corpo focando no músculo dorsal.", wireframe: "back" },
  { id: "ex_agachamento_livre", name: "Agachamento Livre com Barra", muscle: "Pernas", equipment: "Barra, Hack", difficulty: "Avançado", desc: "Com a barra nos ombros, flexione os joelhos jogando o quadril para trás como se fosse sentar, descendo até 90 graus.", wireframe: "legs" },
  { id: "ex_leg_press", name: "Leg Press 45°", muscle: "Pernas", equipment: "Máquina Leg Press", difficulty: "Iniciante", desc: "Sentado na máquina, empurre a plataforma com os pés afastados na largura dos ombros, evitando esticar totalmente os joelhos.", wireframe: "legs" },
  { id: "ex_cadeira_extensora", name: "Cadeira Extensora", muscle: "Pernas", equipment: "Cadeira Extensora", difficulty: "Iniciante", desc: "Sentado na máquina com o apoio nos tornozelos, estenda completamente as pernas contraindo o quadríceps.", wireframe: "legs" },
  { id: "ex_desenvolvimento_halteres", name: "Desenvolvimento com Halteres", muscle: "Ombros", equipment: "Halteres, Banco", difficulty: "Intermediário", desc: "Sentado com encosto reto, empurre os halteres acima da cabeça partindo da linha das orelhas.", wireframe: "shoulders" },
  { id: "ex_elevacao_lateral", name: "Elevação Lateral", muscle: "Ombros", equipment: "Halteres", difficulty: "Iniciante", desc: "Em pé, eleve os braços lateralmente até a altura dos ombros, mantendo uma leve flexão nos cotovelos.", wireframe: "shoulders" },
  { id: "ex_rosca_direta", name: "Rosca Direta com Barra", muscle: "Bíceps", equipment: "Barra", difficulty: "Iniciante", desc: "Em pé, segure a barra com pegada supinada e flexione os cotovelos trazendo a barra até o peito sem mover os ombros.", wireframe: "biceps" },
  { id: "ex_rosca_martelo", name: "Rosca Martelo com Halteres", muscle: "Bíceps", equipment: "Halteres", difficulty: "Iniciante", desc: "Com pegada neutra (palmas voltadas para dentro), flexione os cotovelos trazendo os halteres para cima alternadamente.", wireframe: "biceps" },
  { id: "ex_tricep_pulley", name: "Tríceps Pulley (Corda)", muscle: "Tríceps", equipment: "Polia, Corda", difficulty: "Iniciante", desc: "Segurando a corda na polia alta, empurre as mãos para baixo abrindo as pontas da corda na extensão máxima.", wireframe: "triceps" },
  { id: "ex_tricep_frances", name: "Tríceps Francês Unilateral", muscle: "Tríceps", equipment: "Halter", difficulty: "Intermediário", desc: "Segure o halter atrás da cabeça flexionando o cotovelo e faça a extensão vertical total do braço.", wireframe: "triceps" },
  { id: "ex_infra_solo", name: "Abdominal Infra no Solo", muscle: "Abdômen", equipment: "Colchonete", difficulty: "Iniciante", desc: "Deitado, eleve as pernas estendidas até 90 graus e retorne lentamente sem encostar os pés no chão.", wireframe: "abs" },
  { id: "ex_prancha_isometrica", name: "Prancha Isométrica", muscle: "Abdômen", equipment: "Colchonete", difficulty: "Iniciante", desc: "Apoie os antebraços e pontas dos pés no solo, mantendo o corpo totalmente alinhado e o abdômen contraído.", wireframe: "abs" }
];

let workouts = [];
let selectedWorkoutId = null;
let activeWorkout = null;
let currentExerciseIndex = 0;
let currentSetIndex = 0;

let restTimerInterval = null;
let restTimeLeft = 0;
let restTotalDuration = 60;
let isRestTimerRunning = false;

function loadWorkouts() {
  const stored = localStorage.getItem('fithub_workouts');
  if (stored) {
    workouts = JSON.parse(stored);
  } else {
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
  if (!container) return;
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

  if (actionButtons) actionButtons.style.display = "flex";
  if (header) header.querySelector('h3').textContent = workout.name.toUpperCase();

  if (!body) return;

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

  const activeName = document.getElementById('active-workout-name');
  if (activeName) activeName.textContent = workout.name;
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

let selectedExerciseIdForWorkout = null;

function showAddExerciseModal() {
  if (!selectedWorkoutId) return;
  document.getElementById('add-exercise-modal').style.display = "flex";
  
  const container = document.getElementById('modal-exercise-list-container');
  if (!container) return;
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
  if (!isUserAuthenticated) {
    showToast("Faça o login primeiro!");
    return;
  }
  
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
  if (!container) return;
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

  const execWave = document.getElementById('exec-waveform');
  if (execWave) execWave.classList.add('active');

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
  if (!display) return;
  display.textContent = restTimeLeft.toString().padStart(2, '0');

  const progressRing = document.getElementById('timer-progress-ring');
  if (progressRing) {
    const offset = 283 - (restTimeLeft / restTotalDuration) * 283;
    progressRing.style.strokeDashoffset = offset;
  }
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
