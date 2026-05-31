let audioCtx = null;
let oscillatorPool = [];
let visualizerAnimation = null;

// Semantic & Frequency Database (Har language ke keywords map kiye hain)
const emotionalMatrix = {
    happy: {
        keywords: ['happy', 'khushi', 'pyaar', 'love', 'muskurana', 'dance', 'nacho', 'celebrate', 'fiesta'],
        ragaName: "Bhairavi / Major Pentatonic (Joyous)",
        frequencies: [261.63, 293.66, 329.63, 392.00, 440.00] // C, D, E, G, A
    },
    sad: {
        keywords: ['sad', 'dard', 'lonely', 'akela', 'rona', 'tears', 'dark', 'judai', 'gam', 'triste'],
        ragaName: "Shivaranjani / Minor Pentatonic (Melancholic)",
        frequencies: [261.63, 293.66, 311.13, 392.00, 440.00] // C, D, D#, G, A
    },
    spiritual: {
        keywords: ['god', 'bhagwan', 'shanti', 'peace', 'om', 'prayer', 'sukoon', 'spirit', 'universe'],
        ragaName: "Yaman / Lydian Scale (Spiritual Meditative)",
        frequencies: [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88] // C, D, E, F#, G, A, B
    }
};

document.getElementById('quantumGenBtn').addEventListener('click', () => {
    const lyrics = document.getElementById('lyricsMatrix').value.toLowerCase();
    
    if(!lyrics) {
        alert("Please feed lyrics into the matrix first!");
        return;
    }

    // Stop previous sessions if running
    stopMusicEngine();

    // 1. Core AI Logic: Language-Agnostic Sentiment Mapping
    let detectedMood = 'happy'; // Default
    
    for (const [mood, data] of Object.entries(emotionalMatrix)) {
        if (data.keywords.some(keyword => lyrics.includes(keyword))) {
            detectedMood = mood;
            break;
        }
    }

    const targetMoodData = emotionalMatrix[detectedMood];

    // Update Telemetry UI
    document.getElementById('sentimentOutput').innerText = detectedMood.toUpperCase();
    document.getElementById('ragaOutput').innerText = targetMoodData.ragaName;
    document.getElementById('telemetrySection').classList.remove('hidden');

    // 2. Initialize Web Audio API (Generative Synthesizer Core)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create Nodes
    const masterGain = audioCtx.createGain();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
    masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime); // Safe Volume

    // Play Generative Soundscape based on Frequencies
    targetMoodData.frequencies.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // Create complex textures using Sine & Triangle waves
        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Algorithmic Arpeggiator (Notes up and down dynamically)
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        
        // This math loop creates an endless custom melody rhythm naturally
        for(let i = 0; i < 100; i++) {
            let timeOffset = i * (0.4 + (index * 0.15));
            gainNode.gain.linearRampToValueAtTime(0.2, now + timeOffset + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, now + timeOffset + 0.3);
        }

        osc.connect(gainNode);
        gainNode.connect(masterGain);
        osc.start();
        
        oscillatorPool.push(osc);
    });

    // 3. Fire Real-time Visualizer Canvas
    startVisualizer(analyser);
});

// Real-Time Matrix Canvas Visualizer
function startVisualizer(analyser) {
    const canvas = document.getElementById('visualizerCanvas');
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        visualizerAnimation = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 1.5;

            // Cyberpunk color transition
            ctx.fillStyle = `rgb(${barHeight + 100}, 0, 255)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

            x += barWidth;
        }
    }
    draw();
}

function stopMusicEngine() {
    if(oscillatorPool.length > 0) {
        oscillatorPool.forEach(osc => { try { osc.stop(); } catch(e){} });
        oscillatorPool = [];
    }
    if(audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
    if(visualizerAnimation) {
        cancelAnimationFrame(visualizerAnimation);
    }
}

document.getElementById('playbackBtn').addEventListener('click', () => {
    stopMusicEngine();
    document.getElementById('telemetrySection').classList.add('hidden');
});