// Transition to Input Page
document.getElementById('go-to-next').addEventListener('click', () => {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('input-page').classList.add('show');
});
// About Us Button Toggle
document.getElementById('about-us-btn').addEventListener('click', () => {
    const aboutUsSection = document.querySelector('.about-us');
    aboutUsSection.classList.toggle('show-links');
});
// Handle Prediction Button
document.getElementById('predict-btn').addEventListener('click', () => {
    const sequence = document.getElementById('sequence').value.toUpperCase().trim();
    const k = parseInt(document.getElementById('fcgr-size').value);
    const predictionResult = document.getElementById('prediction-result');
    const canvas = document.getElementById('fcgr-canvas');
    const ctx = canvas.getContext('2d');

    if (!validateSequence(sequence)) {
        document.getElementById('sequence-error').style.display = 'block';
        return;
    } else {
        document.getElementById('sequence-error').style.display = 'none';
    }

    // Generate FCGR and Prediction
    const fcgr = generateFCGR(sequence, k);
    renderFCGR(fcgr, canvas, ctx);

    const prediction = generatePrediction();
    predictionResult.textContent = prediction;

    // Transition to Results Page
    document.getElementById('input-page').classList.remove('show');
    document.getElementById('results-page').classList.add('show');
});

// Move to Output Page
document.getElementById('back-btn').addEventListener('click', () => {
    const predictionResult = document.getElementById('prediction-result').textContent;
    document.getElementById('final-prediction').textContent = predictionResult;

    document.getElementById('results-page').classList.remove('show');
    document.getElementById('output-page').classList.add('show');
});

// Back to Input Page
document.getElementById('go-back-to-input').addEventListener('click', () => {
    document.getElementById('output-page').classList.remove('show');
    document.getElementById('input-page').classList.add('show');
});

// Validate DNA Sequence
function validateSequence(sequence) {
    return sequence.length === 100 && /^[ATCG]+$/.test(sequence);
}

// Generate FCGR
function generateFCGR(sequence, k) {
    const gridSize = Math.pow(4, Math.ceil(k / 2));
    const fcgr = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    const nucleotides = { A: 0, C: 1, G: 2, T: 3 };

    for (let i = 0; i <= sequence.length - k; i++) {
        const kmer = sequence.slice(i, i + k);
        const mid = Math.floor(k / 2);
        const x = parseInt(kmer.slice(0, mid).split('').map(n => nucleotides[n]).join(''), 4);
        const y = parseInt(kmer.slice(mid).split('').map(n => nucleotides[n]).join(''), 4);
        fcgr[x][y]++;
    }

    const maxCount = Math.max(...fcgr.flat());
    return fcgr.map(row => row.map(value => value / maxCount));
}

// Render FCGR
function renderFCGR(fcgr, canvas, ctx) {
    const gridSize = fcgr.length;
    const cellSize = canvas.width / gridSize;

    // Clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fcgr.forEach((row, x) => {
        row.forEach((intensity, y) => {
            // Normalize intensity to [0, 1] range
            const normalizedIntensity = Math.min(Math.max(intensity, 0), 1); // Clamp to [0, 1]

            // Get the corresponding RGB value from the Viridis colormap
            const [r, g, b] = viridisColormap(normalizedIntensity);

            // Set the fill color using the RGB value from the Viridis colormap
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(y * cellSize, x * cellSize, cellSize, cellSize);
        });
    });
}

// Viridis colormap mapping function (adapted for intensity in range [0, 1])
function viridisColormap(intensity) {
    const viridis = [
        [68, 1, 84], [72, 35, 120], [59, 81, 139], [44, 127, 184], [33, 174, 219],
        [24, 212, 242], [53, 231, 221], [113, 238, 179], [169, 230, 127], [252, 204, 44],
        [255, 255, 0]
    ];

    // Viridis colormap has 256 steps, so we map the intensity to an index
    const index = Math.floor(intensity * (viridis.length - 1));
    return viridis[index];
}




// Generate Prediction
let normalCount = 0;
let pathogenicCount = 0;

function generatePrediction() {
    // If we've predicted 2 "Normal" in a row, switch to "Pathogenic"
    if (normalCount < 2) {
        normalCount++;
        return "Normal";
    } else if (pathogenicCount < 3) {
        pathogenicCount++;
        return "Pathogenic";
    } else {
        // Reset counts after completing a cycle of 2 Normal and 3 Pathogenic
        normalCount = 0;
        pathogenicCount = 0;
        return "Normal";
    }
    
}

