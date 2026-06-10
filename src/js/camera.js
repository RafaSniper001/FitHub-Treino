// FitHub Treino - Módulo de Câmera e Biomecânica (camera.js)

let webcamStream = null;
let activeWebcamElement = null;
let activeCanvasElement = null;
let hudAnimationId = null;
let lastFpsUpdate = 0;
let framesCount = 0;
let currentFps = 30.0;
let trackerPoints = [];

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

  // Linhas do esqueleto conectando as juntas
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

  // Nós das juntas
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
  if (!container) return;
  
  const snaps = JSON.parse(localStorage.getItem('fithub_snapshots') || '[]');

  if (snaps.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    document.querySelectorAll('.snapshot-item').forEach(el => el.remove());
    return;
  }

  if (emptyState) emptyState.style.display = "none";
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

  // Grid
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
