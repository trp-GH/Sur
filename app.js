let audioCtx = null;
let oscillatorPool = [];
let visualizerAnimation = null;
let isPlaying = false;
let songInterval = null; // Song loop controller

// Musically Accurate Sentiment & Frequency Database (Raga-Based)
const emotionalMatrix = {
    happy: {
        keywords: ['happy', 'khushi', 'pyaar', 'love', 'muskurana', 'dance', 'nacho', 'celebrate', 'fiesta', 'mubarak'],
        ragaName: "Raga Bilawal / Hamsadhwani (Joyous & Bright)",
        frequencies: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88] // Sa Re Ga Ma Pa Dha Ni (C Major)
    },
    sad: {
        keywords: ['sad', 'dard', 'lonely', 'akela', 'rona', 'tears', 'dark', 'judai', 'gam', 'triste', 'karuna'],
        ragaName: "Raga Bhairavi (Pathos, Virah & Melancholy)",
        frequencies: [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16] // Komal Swaras
    },
    romantic: {
        keywords: ['romantic', 'dil', 'shayar', 'beautiful', 'humsafar', 'chaand', 'eyes', 'ishq', 'mohabbat'],
        ragaName: "Raga Yaman (Romantic & Evening Melodies)",
        frequencies: [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88] // Teevra Ma
    },
    peaceful: {
        keywords: ['god', 'bhagwan', 'shanti', 'peace', 'om', 'prayer', 'sukoon', 'spirit', 'universe', 'calm'],
        ragaName: "Raga Ahir Bhairav (Peaceful & Meditative Morning)",
        frequencies: [261.63, 277.18, 329.63, 349.23, 392.00, 440.00, 466.16]
    },
    energetic: {
        keywords: ['power', 'energy', 'run', 'fight', 'josh', 'kranti', 'fast', 'drums', 'jeet'],
        ragaName: "Raga Desh / Kafi (Energetic, Folk & Patriotic)",
        frequencies: [261.63, 293.66, 349.23, 392.00, 440.00, 466.16]
    }
};

document.getElementById('quantumGenBtn').addEventListener('click', () => {
    const lyrics = document.getElementById('lyricsMatrix').value.toLowerCase();
    
    if(!lyrics) {
        alert("Please feed lyrics into the matrix first! / Kripya lyrics likhein.");
        return;
    }

    // Purane session ko safa karein
    stopMusicEngine();

    // 1. AI Sentiment Detection Loop
    let detectedMood = 'happy'; 
    for (const [mood, data] of Object.entries(emotionalMatrix)) {
        if (data.keywords.some(keyword => lyrics.includes(keyword))) {
            detectedMood = mood;
            break;
        }
    }

    const targetMoodData = emotionalMatrix[detectedMood];

    // UI Updates
    document.getElementById('sentimentOutput').innerText = detectedMood.toUpperCase();
    document.getElementById('ragaOutput').innerText = targetMoodData.ragaName;
    document.getElementById('telemetrySection').classList.remove('hidden');

    // 2. Initialize Audio Context
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = audioCtx.createGain();
    const analyser = audioCtx.createAnalyser();
    
    analyser.fftSize = 256;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
    masterGain.gain.setValueAtTime(0.25, audioCtx.currentTime);

    isPlaying = true;
    let step = 0;
    const scale = targetMoodData.frequencies;

    // 3. THE LIVE SONG COMPOSER ENGINE (Rhythm + Melody)
    // Yeh loop har 300ms mein ek naya note aur beat bajayega, jisse gaana banta hai
    songInterval = setInterval(() => {
        if (!isPlaying) return;

        const now = audioCtx.currentTime;

        // --- PART A: MELODY GENERATION (Dhun) ---
        // Algorithmic note selection based on lyrics length and steps
        let noteIndex = (step + lyrics.length) % scale.length;
        // Kabhi-kabhi octave badalne ke liye mathematical variation
        let frequency = scale[noteIndex];
        if (step % 8 === 0) frequency *= 0.5; // Base Note Drop
        if (step % 6 === 0) frequency *= 2;   // High Note Jump

        const osc = audioCtx.createOscillator();
        const synthGain = audioCtx.createGain();
        
        // Mood ke hisab se instrument ka texture badlein
        osc.type = detectedMood === 'sad' || detectedMood === 'peaceful' ? 'sine' : 'triangle'; 
        osc.frequency.setValueAtTime(frequency, now);

        // Note Envelope (Attack, Decay, Release - isse professional sound aati hai)
        synthGain.gain.setValueAtTime(0, now);
        synthGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(synthGain);
        synthGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.4);
        oscillatorPool.push(osc);

        // --- PART B: RHYTHM BEAT ENGINE (Taal / Drums) ---
        // Step 0, 4, 8 par Kick Drum sound mathematially generate hogi
        if (step % 4 === 0) {
            const kickOsc = audioCtx.createOscillator();
            const kickGain = audioCtx.createGain();
            
            kickOsc.frequency.setValueAtTime(120, now);
            kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);
            
            kickGain.gain.setValueAtTime(0.3, now);
            kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            
            kickOsc.connect(kickGain);
            kickGain.connect(masterGain);
            kickOsc.start(now);
            kickOsc.stop(now + 0.15);
            oscillatorPool.push(kickOsc);
        }

        // Step 2, 6 par Snare/Hi-Hat (Chhan-Chhan) texture sound noise logic se
        if (step % 4 === 2) {
            const hatOsc = audioCtx.createOscillator();
            const hatGain = audioCtx.createGain();
            hatOsc.type = 'sawtooth';
            hatOsc.frequency.setValueAtTime(8000, now); // High Frequency Noise
            
            hatGain.gain.setValueAtTime(0.03, now);
            hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            
            hatOsc.connect(hatGain);
            hatGain.connect(masterGain);
            hatOsc.start(now);
            hatOsc.stop(now + 0.06);
            oscillatorPool.push(hatOsc);
        }

        step++;
    }, 300); // Speed of the song (BPM Controller)

    // Start Visualizer Canvas
    startVisualizer(analyser);
});

// Live Cyberpunk Visualizer Matrix
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
            barHeight = dataArray[i] / 1.3;
            // Dynamic colorful gradients based on audio energy
            ctx.fillStyle = `rgb(${barHeight + 80}, ${i * 2}, 255)`;
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
