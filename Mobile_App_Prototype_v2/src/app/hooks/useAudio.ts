// Hook para reproduzir efeitos sonoros
export const useAudio = () => {
  const playSound = (type: 'win' | 'lose' | 'click' | 'level-up' | 'breathe' | 'tick' | 'error') => {
    try {
      // Usando Web Audio API para sons simples (sem precisar carregar ficheiros)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      switch (type) {
        case 'win':
          // Sequência vencedora: sol-si-ré
          playTone(audioContext, 392, 0.2, now); // sol
          playTone(audioContext, 494, 0.2, now + 0.15);
          playTone(audioContext, 587, 0.4, now + 0.3); // ré
          break;
        case 'lose':
          // Som de perda: ré-do
          playTone(audioContext, 293, 0.3, now);
          playTone(audioContext, 261, 0.3, now + 0.2);
          break;
        case 'click':
          // Click simples
          playTone(audioContext, 800, 0.1, now);
          break;
        case 'level-up':
          // Ascendente
          playTone(audioContext, 349, 0.15, now);
          playTone(audioContext, 392, 0.15, now + 0.1);
          playTone(audioContext, 493, 0.15, now + 0.2);
          playTone(audioContext, 587, 0.3, now + 0.3);
          break;
        case 'breathe':
          // Som relaxante para respiração
          playNoise(audioContext, 0.5, now);
          break;
        case 'tick':
          // Tick simples para cronómetro
          playTone(audioContext, 1000, 0.05, now);
          break;
        case 'error':
          // Som de erro
          playTone(audioContext, 150, 0.2, now);
          playTone(audioContext, 100, 0.2, now + 0.1);
          break;
      }
    } catch (e) {
      console.log('Audio não disponível:', e);
    }
  };

  const playTone = (ctx: AudioContext, freq: number, duration: number, startTime: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = freq;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const playNoise = (ctx: AudioContext, duration: number, startTime: number) => {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    source.start(startTime);
  };

  return { playSound };
};
