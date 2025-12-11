
/**
 * Plays synthesized sounds for app notifications using the Web Audio API.
 * No external assets required.
 */
export const playSound = (type: 'COMPLETE' | 'BREAK') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();

    const playTone = (freq: number, start: number, duration: number, vol: number = 0.1) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    
    if (type === 'COMPLETE') {
        // Success chime: Ascending Major Triad (C5 - E5 - G5)
        playTone(523.25, now, 0.3);       // C5
        playTone(659.25, now + 0.15, 0.3); // E5
        playTone(783.99, now + 0.3, 0.6);  // G5
    } else if (type === 'BREAK') {
        // Alarm style: 3 distinct beeps
        playTone(880, now, 0.15, 0.15);
        playTone(880, now + 0.3, 0.15, 0.15);
        playTone(880, now + 0.6, 0.4, 0.15);
    }
  } catch (e) {
    console.error("Audio error", e);
  }
};
