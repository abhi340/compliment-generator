// d:\Compliment your moment\script.js

// --- Configuration ---
const API_CONFIG = {
    gemini: {
        // API_KEY removed; to be handled by a backend proxy if AI features are re-enabled.
        // ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent' // Kept for reference if using a proxy
        ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent'
    },
    deepseek: {
        // API_KEY removed; to be handled by a backend proxy if AI features are re-enabled.
        // ENDPOINT: 'https://api.deepseek.com/v1/chat/completions', // Kept for reference if using a proxy
        ENDPOINT: 'https://api.deepseek.com/v1/chat/completions',
        MODEL: 'deepseek-chat'
    }
};

// --- Elements ---
const complimentButton = document.getElementById('complimentButton');
const pageHeading = document.querySelector('.container h1');
const containerComplimentText = document.getElementById('containerComplimentText');
const regenerateButton = document.getElementById('regenerateButton');
const mainContainer = document.querySelector('.container');
let loadingAnimationInterval = null; // To store the interval ID for the loading animation

// --- Local Fallback Compliments ---
const localCompliments = [
    "You're doing great!",
    "Your smile is a ray of sunshine on a cloudy day!",
    "You bring out the best in other people.",
    "You make a bigger impact than you realize.",
    "You're a smart cookie!",
    "Keep shining brightly!",
    "You've got this!",
    "You are appreciated."
];

// --- AI Compliment Generation using Gemini API ---
async function fetchAICompliment() {
    const { API_KEY, ENDPOINT } = API_CONFIG.gemini;
    if (!API_KEY) { // API_KEY is no longer in API_CONFIG for client-side
        console.warn("Gemini API Key not available in client-side config. Assumes backend proxy or disabled feature.");
        throw new Error("Gemini API Key not configured.");
    }
    const GEMINI_API_URL = `${ENDPOINT}?key=${API_KEY}`;
    const promptText = "Generate a short, unique, and uplifting compliment for a person. Make it sound genuine and positive.";

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: promptText
                    }]
                }],
                generationConfig: {
                  "temperature": 0.8,
                  "topK": 1,
                  "topP": 1,
                  "maxOutputTokens": 60,
                },
                safetySettings: [
                  { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
                  { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
                  { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
                  { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Unknown API error, response not JSON." }));
            console.error("API Error Response:", errorData);
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || errorData.message || 'Failed to fetch'}`);
        }

        const data = await response.json();

        const complimentText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (complimentText) {
            return complimentText.trim().replace(/^"|"$/g, '');
        } else {
            console.error("Could not extract compliment from AI response:", data);
            throw new Error("AI did not return a valid compliment structure.");
        }
    } catch (error) {
        console.error("Error fetching AI compliment:", error);
        throw error;
    }
}

// --- AI Compliment Generation using DeepSeek API (as a fallback) ---
async function fetchDeepSeekCompliment() {
    const { API_KEY, ENDPOINT, MODEL } = API_CONFIG.deepseek;
    if (!API_KEY) { // API_KEY is no longer in API_CONFIG for client-side
       console.warn("DeepSeek API Key not available in client-side config. Assumes backend proxy or disabled feature.");
       throw new Error("DeepSeek API Key not configured.");
   }

    const promptText = "Generate a short, unique, and uplifting compliment for a person. Make it sound genuine and positive. Keep it concise.";

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { "role": "user", "content": promptText }
                ],
                max_tokens: 60,
                temperature: 0.8,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Unknown DeepSeek API error, response not JSON." }));
            console.error("DeepSeek API Error Response:", errorData);
            throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || errorData.message || 'Failed to fetch'}`);
        }

        const data = await response.json();
        const complimentText = data.choices?.[0]?.message?.content;

        if (complimentText) {
            return complimentText.trim().replace(/^"|"$/g, '');
        } else {
            console.error("Could not extract compliment from DeepSeek AI response:", data);
            throw new Error("DeepSeek AI did not return a valid compliment structure.");
        }
    } catch (error) {
        console.error("Error fetching DeepSeek AI compliment:", error);
        throw error; // Re-throw to be caught by displayCompliment
    }
}

// Helper function to try fetching compliments from a list of API functions
async function getComplimentFromRegisteredAPIs() {
    const apiFetchers = [
        { name: "Gemini", fetcher: fetchAICompliment },
        { name: "DeepSeek", fetcher: fetchDeepSeekCompliment }
    ];

    for (const api of apiFetchers) {
        try {
            console.log(`Attempting to fetch compliment from ${api.name} API...`);
            const compliment = await api.fetcher();
            console.log(`Successfully fetched compliment from ${api.name} API.`);
            return compliment;
        } catch (error) {
            console.warn(`${api.name} API call failed:`, error.message, "Trying next API if available.");
        }
    }
    throw new Error("All AI services failed to generate a compliment.");
}

async function displayCompliment() {
    if (!pageHeading || !complimentButton || !containerComplimentText || !regenerateButton) {
        console.error("One or more UI elements are missing.");
        return;
    }

    // Hide the initial heading and main button
    if (pageHeading) pageHeading.style.display = 'none';
    if (complimentButton) complimentButton.style.display = 'none';
    regenerateButton.style.display = 'none';
    containerComplimentText.style.display = 'block';

    const loadingMessages = [ // You can customize these!
        "Rummaging for good vibes...",
        "Consulting the digital oracle...",
        "Warming up the compliment engine...",
        "Polishing a gem for you...",
        "Adding extra sparkle ✨...",
        "Almost there, hang tight!",
        "Summoning happy thoughts...",
        "Tickling the AI's funny bone..."
    ];
    let messageIndex = 0;
    containerComplimentText.textContent = loadingMessages[messageIndex];
    loadingAnimationInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        containerComplimentText.textContent = loadingMessages[messageIndex];
    }, 800);

    try {
        const newCompliment = await getComplimentFromRegisteredAPIs();
        containerComplimentText.textContent = newCompliment;
    } catch (error) {
        console.error("All API attempts failed:", error.message);
        // Use local fallback if all APIs fail
        const randomIndex = Math.floor(Math.random() * localCompliments.length);
        containerComplimentText.textContent = localCompliments[randomIndex] || "You're awesome!"; // Extra safety
    } finally {
        if (loadingAnimationInterval) {
            clearInterval(loadingAnimationInterval);
            loadingAnimationInterval = null;
        }
        if (regenerateButton) regenerateButton.style.display = 'inline-block';
    }
}

if (complimentButton) {
    complimentButton.addEventListener('click', () => {
        console.log('Generate Happiness! button clicked. Hiding initial content.');
        displayCompliment();
    });
} else {
    console.error("Error: Compliment button with ID 'complimentButton' not found.");
}

if (regenerateButton) {
    regenerateButton.addEventListener('click', () => {
        displayCompliment();
    });
} else {
    console.error("Error: Regenerate button with ID 'regenerateButton' not found.");
}


// --- Particle System ---
const numParticles = 200;
const particles = [];
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const ATTRACTION_RADIUS = 150;
const PARTICLE_ACCELERATION = 0.003;
const RANDOM_DRIFT_STRENGTH = 0.05;
const PARTICLE_FRICTION = 0.95;
const DEFAULT_PARTICLE_OPACITY = 0.3;

function createParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const size = Math.random() * 10 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    particle.style.left = `${Math.random() * window.innerWidth}px`;
    particle.style.top = `${Math.random() * window.innerHeight}px`;
    particle.vx = (Math.random() - 0.5) * 2;
    particle.vy = (Math.random() - 0.5) * 2;
    particle.opacityTarget = DEFAULT_PARTICLE_OPACITY;

    document.body.appendChild(particle);
    particles.push(particle);
}

for (let i = 0; i < numParticles; i++) {
    createParticle();
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.body.addEventListener('mouseleave', () => {
    particles.forEach(p => p.opacityTarget = DEFAULT_PARTICLE_OPACITY);
});


function animateParticles() {
    particles.forEach(particle => {
        const dx = mouseX - parseFloat(particle.style.left);
        const dy = mouseY - parseFloat(particle.style.top);
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distanceToMouse < ATTRACTION_RADIUS) {
            particle.vx += dx * PARTICLE_ACCELERATION;
            particle.vy += dy * PARTICLE_ACCELERATION;
            const proximityFactor = Math.max(0, 1 - (distanceToMouse / ATTRACTION_RADIUS));
            particle.opacityTarget = DEFAULT_PARTICLE_OPACITY + (1 - DEFAULT_PARTICLE_OPACITY) * proximityFactor;
        } else {
            particle.vx += (Math.random() - 0.5) * RANDOM_DRIFT_STRENGTH;
            particle.vy += (Math.random() - 0.5) * RANDOM_DRIFT_STRENGTH;
            particle.opacityTarget = DEFAULT_PARTICLE_OPACITY;
        }

        particle.vx *= PARTICLE_FRICTION;
        particle.vy *= PARTICLE_FRICTION;

        let newX = parseFloat(particle.style.left) + particle.vx;
        let newY = parseFloat(particle.style.top) + particle.vy;
        
        particle.style.left = `${newX}px`;
        particle.style.top = `${newY}px`;

        let currentOpacity = parseFloat(particle.style.opacity) || 0;
        if (Math.abs(currentOpacity - particle.opacityTarget) > 0.01) {
            currentOpacity += (particle.opacityTarget - currentOpacity) * 0.1; // Smooth transition
            particle.style.opacity = currentOpacity;
        }

        const size = parseFloat(particle.style.width);
        // Boundary checks (simple bounce and clamp)
        if (newX < size / 2 || newX > window.innerWidth - size / 2) particle.vx *= -0.8;
        if (newY < size / 2 || newY > window.innerHeight - size / 2) particle.vy *= -0.8;
        particle.style.left = `${Math.max(size / 2, Math.min(newX, window.innerWidth - size / 2))}px`;
        particle.style.top = `${Math.max(size / 2, Math.min(newY, window.innerHeight - size / 2))}px`;
    });
    requestAnimationFrame(animateParticles);
}

document.addEventListener('DOMContentLoaded', () => {
    animateParticles();
});
