let audioCtx = null;
let oscillatorPool = [];
let visualizerAnimation = null;
let isPlaying = false;
let songInterval = null; 

// Advanced Musical Matrix with structural chord root progressions
const emotionalMatrix = {
    happy: {
        keywords: ['happy', 'khushi', 'pyaar', 'love', 'muskurana', 'dance', 'nacho', 'celebrate', 'fiesta', 'mubarak'],
        ragaName: "Raga Bilawal / Hamsadhwani (Joyous & Bright)",
        melodyNotes: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // Sa Re Ga Pa Dha Sa (High Octave)
        bassNotes: [130.81, 146.83, 164.81, 196.00] // Deeper Root Harmonies
    },
    sad: {
        keywords: ['sad', 'dard', 'lonely', 'akela', 'rona', 'tears', 'dark', 'judai', 'gam', 'triste', 'karuna'],
        ragaName: "Raga Bhairavi (Pathos, Virah & Melancholy)",
        melodyNotes: [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16], // Komal Swaras
        bassNotes: [130.81, 138.59, 155.56, 196.00]
    },
    romantic: {
        keywords: ['romantic', 'dil', 'shayar', 'beautiful', 'humsafar', 'chaand', 'eyes', 'ishq', 'mohabbat'],
        ragaName: "Raga Yaman (Romantic & Evening Melodies)",
        melodyNotes: [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88], // Teevra Ma
        bassNotes: [130.81, 164.81, 185.00, 196.00]
    },
    peaceful: {
        keywords: ['god', 'bhagwan', 'shanti', 'peace', 'om', 'prayer', 'sukoon', 'spirit', 'universe', 'calm'],
        ragaName: "Raga Ahir Bhairav (Peaceful & Meditative Morning)",
        melodyNotes: [261.63, 277.18, 329.63, 349.23, 392.00, 440.00],
        bassNotes: [130.81, 138.59, 164.81, 196.00]
    },
    energetic: {
        keywords: ['power', 'energy', 'run', 'fight', 'josh', 'kranti', 'fast', 'drums', 'jeet'],
        ragaName: "Raga Desh / Kafi (Energetic, Folk & Patriotic)",
        melodyNotes: [261.63, 293.66, 349.23, 392.00, 466.16],
        bassNotes: [130.81, 146.83, 196.00, 233.08]
    }
};

document.getElementById('quantumGenBtn').addEventListener('click', async () => {
    const lyrics = document.getElementById('lyricsMatrix').value.toLowerCase().trim();
    
    if(!lyrics) {
        alert("Kripya pehle lyrics matrix mein apna gaana likhein!");
        return;
    }

    // Pehle se chal rahe sound ko clear karein
    stopMusicEngine();

    // 1. Semantic Mood Detection
    let detectedMood = 'happy'; 
    for (const [mood, data] of Object.entries(emotionalMatrix)) {
        if (data.keywords.some(keyword => lyrics.includes(keyword))) {
            detectedMood = mood;
            break;
        }
    }

    const targetMoodData = emotionalMatrix[detectedMood];

    // UI Feedback
    document.getElementById('sentimentOutput').innerText = detectedMood.toUpperCase();
    document.getElementById('ragaOutput').innerText = targetMoodData.ragaName;
    document.getElementById('telemetrySection').classList.remove('hidden');

    // 2. Setup Audio Environment & Master Gain Control
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    const masterGain = audioCtx.createGain();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
    masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime); // Normal Listening Level

    isPlaying = true;
    let step = 0;
    
    const melodyScale = targetMoodData.melodyNotes;
    const bassScale = targetMoodData.bassNotes;

    // 3. ADVANCED COMPOSER: Structural Song Architecture Loop
    songInterval = setInterval(() => {
        if (!isPlaying || !audioCtx) return;

        const now = audioCtx.currentTime;

        // --- LAYER A: DEEP RHYTHMIC BASS CHORD (Base Sound Loop) ---
        if (step % 8 === 0) {
            const bassOsc = audioCtx.createOscillator();
            const bassGain = audioCtx.createGain();
            
            // Rich texture combination for warm background melody chord
            bassOsc.type = 'triangle';
            let bassNote = bassScale[(step / 8) % bassScale.length];
            bassOsc.frequency.setValueAtTime(bassNote, now);
            
            bassGain.gain.setValueAtTime(0, now);
            bassGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8); // Long sustain chord
            
            bassOsc.connect(bassGain);
            bassGain.connect(masterGain);
            bassOsc.start(now);
            bassOsc.stop(now + 1.9);
            oscillatorPool.push(bassOsc);
        }

        // --- LAYER B: COMPOSING VARIED MELODY (Not repeating the same beep) ---
        // Creating structural patterns rather than mathematical loop lines
        let patternSelector = [0, 2, 4, 3, 1, 5, 2, 4, 1, 3, 5, 0][step % 12];
        let frequency = melodyScale[patternSelector % melodyScale.length];
        
        // Humanized Octave Variation (Makes it sound like a real composition)
        if (step % 16 >= 12) {
            frequency *= 1.5; // High octave bridging part of the song
        } else if (step % 7 === 0) {
            frequency *= 0.75; // Harmonized downward dip
        }

        const melodyOsc = audioCtx.createOscillator();
        const melodyGain = audioCtx.createGain();
        
        // Instrument styling logic
        melodyOsc.type = (detectedMood === 'sad' || detectedMood === 'peaceful') ? 'sine' : 'sawtooth';
        melodyOsc.frequency.setValueAtTime(frequency, now);

        // Smooth Synth-Pluck Envelope (No harsh clicking or continuous loop beeps)
        melodyGain.gain.setValueAtTime(0, now);
        melodyGain.gain.linearRampToValueAtTime(0.12, now + 0.03);
        melodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        // Subtle dynamic audio filter to mimic acoustic instruments (Flute/Sitar effect)
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(detectedMood === 'happy' ? 2000 : 1000, now);

        melodyOsc.connect(filter);
        filter.connect(melodyGain);
        melodyGain.connect(masterGain);
        
        melodyOsc.start(now);
        melodyOsc.stop(now + 0.4);
        oscillatorPool.push(melodyOsc);

        // --- LAYER C: PERCUSSION GROOVE TRAIL (Beats Matrix) ---
        // Heavy Kick / Bass Dholak Pulse
        if (step % 4 === 0) {
            const drumOsc = audioCtx.createOscillator();
            const drumGain = audioCtx.createGain();
            drumOsc.frequency.setValueAtTime(90, now);
            drumOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.12);
            
            drumGain.gain.setValueAtTime(0.3, now);
            drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            
            drumOsc.connect(drumGain);
            drumGain.connect(masterGain);
            drumOsc.start(now);
            drumOsc.stop(now + 0.13);
            oscillatorPool.push(drumOsc);
        }

        // Crisp Soft Hi-Hats on offbeats to maintain standard musical timing (BPM rhythm)
        if (step % 4 === 2 || step % 8 === 5) {
            const hihatOsc = audioCtx.createOscillator();
            const hihatGain = audioCtx.createGain();
            hihatOsc.type = 'triangle';
            hihatOsc.frequency.setValueAtTime(9000, now); // High Frequency shimmer
            
            hihatGain.gain.setValueAtTime(0.015, now);
            hihatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            
            hihatOsc.connect(hihatGain);
            hihatGain.connect(masterGain);
            hihatOsc.start(now);
            hihatOsc.stop(now + 0.05);
            oscillatorPool.push(hihatOsc);
        }

        // Performance management: clean old loops to keep browser audio fresh
        if(oscillatorPool.length > 30) {
            oscillatorPool.splice(0, 15);
        }

        step++;
    }, 280); // 280ms per tick = Energetic and beautifully flowing tempo loop

    startVisualizer(analyser);
});

function startVisualizer(analyser) {
    const canvas = document.getElementById('visualizerCanvas');
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        if (!isPlaying) return;
        visualizerAnimation = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#05050a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 1.4;
            ctx.fillStyle = `rgb(${barHeight + 110}, ${i * 2.5}, 255)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
    draw();
}

function stopMusicEngine() {
    isPlaying = false;
    if (songInterval) {
        clearInterval(songInterval);
        songInterval = null;
    }
    if (oscillatorPool.length > 0) {
        oscillatorPool.forEach(osc => { try { osc.stop(); } catch(e){} });
        oscillatorPool = [];
    }
    if (audioCtx) {
        try { audioCtx.close(); } catch(e){}
        audioCtx = null;
    }
    if (visualizerAnimation) {
        cancelAnimationFrame(visualizerAnimation);
    }
}

document.getElementById('playbackBtn').addEventListener('click', () => {
    stopMusicEngine();
    document.getElementById('telemetrySection').classList.add('hidden');
});
