let audioCtx = null;
let oscillatorPool = [];
let visualizerAnimation = null;
let isPlaying = false;
let songInterval = null; 

const emotionalMatrix = {
    happy: {
        keywords: ['happy', 'khushi', 'pyaar', 'love', 'muskurana', 'dance', 'nacho', 'celebrate', 'fiesta', 'mubarak'],
        ragaName: "Raga Bilawal / Hamsadhwani (Joyous & Bright)",
        frequencies: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88] 
    },
    sad: {
        keywords: ['sad', 'dard', 'lonely', 'akela', 'rona', 'tears', 'dark', 'judai', 'gam', 'triste', 'karuna'],
        ragaName: "Raga Bhairavi (Pathos, Virah & Melancholy)",
        frequencies: [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16] 
    },
    romantic: {
        keywords: ['romantic', 'dil', 'shayar', 'beautiful', 'humsafar', 'chaand', 'eyes', 'ishq', 'mohabbat'],
        ragaName: "Raga Yaman (Romantic & Evening Melodies)",
        frequencies: [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88] 
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

document.getElementById('quantumGenBtn').addEventListener('click', async () => {
    const lyrics = document.getElementById('lyricsMatrix').value.toLowerCase().trim();
    
    if(!lyrics) {
        alert("Kripya pehle lyrics matrix mein kuch likhein!");
        return;
    }

    // Purane chal rahe loops ko bilkul saaf karein
    stopMusicEngine();

    // 1. AI Mood Detection
    let detectedMood = 'happy'; 
    for (const [mood, data] of Object.entries(emotionalMatrix)) {
        if (data.keywords.some(keyword => lyrics.includes(keyword))) {
            detectedMood = mood;
            break;
        }
    }

    const targetMoodData = emotionalMatrix[detectedMood];

    // UI Text Updates
    document.getElementById('sentimentOutput').innerText = detectedMood.toUpperCase();
    document.getElementById('ragaOutput').innerText = targetMoodData.ragaName;
    document.getElementById('telemetrySection').classList.remove('hidden');

    // 2. Browser Audio Block Bypass (CRITICAL FIX)
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Agar browser ne audio silent kiya hua hai, toh use zor se active karein
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    const masterGain = audioCtx.createGain();
    const analyser = audioCtx.createAnalyser();
    
    analyser.fftSize = 256;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
    masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

    isPlaying = true;
    let step = 0;
    const scale = targetMoodData.frequencies;

    // 3. Optimized Song Generator Loop
    songInterval = setInterval(() => {
        if (!isPlaying || !audioCtx) return;

        const now = audioCtx.currentTime;

        // --- MELODY (Dhun) ---
        let noteIndex = (step + lyrics.length) % scale.length;
        let frequency = scale[noteIndex];
        
        // rhythmic variations
        if (step % 8 === 0) frequency *= 0.5; 
        if (step % 6 === 0) frequency *= 1.5;   

        const osc = audioCtx.createOscillator();
        const synthGain = audioCtx.createGain();
        
        osc.type = (detectedMood === 'sad' || detectedMood === 'peaceful') ? 'sine' : 'triangle'; 
        osc.frequency.setValueAtTime(frequency, now);

        synthGain.gain.setValueAtTime(0, now);
        synthGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(synthGain);
        synthGain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 0.25);
        oscillatorPool.push(osc);

        // --- BEATS (Taal) ---
        if (step % 4 === 0) { // Kick Drum
            const kick = audioCtx.createOscillator();
            const kickGain = audioCtx.createGain();
            kick.frequency.setValueAtTime(100, now);
            kick.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
            kickGain.gain.setValueAtTime(0.25, now);
            kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            kick.connect(kickGain);
            kickGain.connect(masterGain);
            kick.start(now);
            kick.stop(now + 0.1);
            oscillatorPool.push(kick);
        }

        // Memory Cleanup: Pooled oscillators ko clear karte rahein taaki crash na ho
        if(oscillatorPool.length > 20) {
            oscillatorPool.splice(0, 10);
        }

        step++;
    }, 250); 

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
            barHeight = dataArray[i] / 1.5;
            ctx.fillStyle = `rgb(${barHeight + 100}, ${i * 2}, 255)`;
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
