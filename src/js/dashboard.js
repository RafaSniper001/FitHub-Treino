// FitHub Treino - Dashboard, Estatísticas e Gráficos
// Desenvolvedor: Rafael

// Carrega as estatísticas do localStorage e atualiza os elementos do DOM
function loadStats() {
  const completedWorkouts = parseInt(localStorage.getItem('fithub_stat_completed_workouts') || '0');
  const completedSets = parseInt(localStorage.getItem('fithub_stat_completed_sets') || '0');
  const streak = parseInt(localStorage.getItem('fithub_stat_streak') || '0');
  const totalHours = parseFloat(localStorage.getItem('fithub_stat_hours') || '0.0');
  const totalVolume = parseInt(localStorage.getItem('fithub_stat_volume') || '0');

  const elWorkouts = document.getElementById('stat-completed-workouts');
  const elSets = document.getElementById('stat-total-sets');
  const elStreak = document.getElementById('stat-active-streak');
  const elTime = document.getElementById('dashboard-total-time');
  const elVolume = document.getElementById('dashboard-total-volume');

  if (elWorkouts) elWorkouts.textContent = completedWorkouts;
  if (elSets) elSets.textContent = completedSets;
  if (elStreak) elStreak.textContent = `${streak} dias`;
  if (elTime) elTime.textContent = `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`;
  if (elVolume) elVolume.textContent = `${totalVolume} kg`;
}

// Salva novas estatísticas acumuladas no localStorage
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

// Renderiza o gráfico de barras semanal dinamicamente
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
    
    // Pequena animação para carregar as barras gradualmente
    setTimeout(() => {
      bar.style.height = `${barHeightPct}%`;
    }, 100 * idx);

    barsContainer.appendChild(bar);
  });
}
