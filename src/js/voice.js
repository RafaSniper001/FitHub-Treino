// FitHub Treino - Módulo de Voz e Fala (voice.js)

let voiceEnabled = false;
let recognition = null;
let wasListeningBeforeSpeaking = false;
let activeUtterance = null;

function initVoiceCommands() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const micStatus = document.getElementById('mic-status-text');
    const micDot = document.getElementById('mic-status-dot');
    if (micStatus) micStatus.textContent = "INCOMPATÍVEL";
    if (micDot) micDot.className = "hud-stat-dot red";
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
    // Reinicia caso não tenha sido interrompido intencionalmente
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

  // 1. Temporariamente desliga a escuta para não se auto-ouvir
  if (voiceEnabled && recognition) {
    wasListeningBeforeSpeaking = true;
    recognition.stop();
  } else {
    wasListeningBeforeSpeaking = false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance; // Mantém referência para evitar bug de Garbage Collection
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
