import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


let firebaseConfig = {};
try {
    let rawConfig = '{}';

 
    if (typeof __firebase_config !== 'undefined') {
        rawConfig = __firebase_config;
    } else if (typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined') {
        rawConfig = window.__firebase_config;
    }

    firebaseConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : (rawConfig || {});
} catch (e) {
    console.error('Помилка розбору __firebase_config, використовую порожній конфіг.', e);
    firebaseConfig = {};
}

let app = null;
let auth = null;
let db = null;
let firebaseReady = false;

try {
    if (firebaseConfig && Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        firebaseReady = true;
    } else {
        console.warn('Firebase config is empty or missing apiKey. Firebase features will be disabled.');
    }
} catch (e) {
    console.error('Firebase init error, Firebase features will be disabled.', e);
}

const appId =
    (typeof __app_id !== 'undefined' && __app_id) ||
    (typeof window !== 'undefined' && typeof window.__app_id !== 'undefined' && window.__app_id) ||
    'neon-maze-default';

let user = null;

const initAuth = async () => {
    if (!firebaseReady || !auth) {
        console.warn('Firebase is not ready, skipping auth. Leaderboard will be disabled.');
        return;
    }
    try {
        const token =
            (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) ||
            (typeof window !== 'undefined' && window.__initial_auth_token);

        if (token) {
            await signInWithCustomToken(auth, token);
        } else {
            await signInAnonymously(auth);
        }
    } catch (e) {
        console.error('Auth error', e);
    }
};

if (firebaseReady && auth) {
    onAuthStateChanged(auth, (u) => {
        user = u;
    });
}

initAuth();


const container = document.getElementById('maze-container');
const levelDisplay = document.getElementById('level-val');
const stepsDisplay = document.getElementById('steps-val');
const livesDisplay = document.getElementById('lives-display');
const playerNickUI = document.getElementById('player-nick-ui');
const overlay = document.getElementById('overlay');

  

const stepsDivs = {
    start: document.getElementById('step-start'),
    nickname: document.getElementById('step-nickname'),
    difficulty: document.getElementById('step-difficulty'),
    death: document.getElementById('death-content')
};

let state = {
    nickname: 'Гравець',
    level: 1,
    steps: 0,
    lives: 3,
    difficulty: 'normal',
    maze: [],
    player: { x: 0, y: 0 },
    gridSize: 7
};

window.goToStep = (step) => {
    Object.values(stepsDivs).forEach(div => div.classList.add('hidden'));
    stepsDivs[step].classList.remove('hidden');
    if(step === 'difficulty') {
        const input = document.getElementById('nick-input').value.trim();
        state.nickname = input || 'Гравець';
        playerNickUI.innerText = state.nickname;
    }
};

window.resetToMenu = () => {
    window.goToStep('start');
    overlay.classList.add('height');
    document.getElementById('game').classList.add('hidden');
    document.getElementById('game-card').classList.add('height');
    container.classList.add('hidden');

};

window.setDifficulty = (diff) => {
    state.difficulty = diff;
    startGame();
};

function startGame() {
    overlay.classList.add('hidden');
    state.level = 1;
    loadLevel();
    document.getElementById('game-card').classList.remove('height');
    overlay.classList.remove('height');
    document.getElementById('game').classList.remove('hidden');
    container.classList.remove('hidden');
}

function loadLevel() {
    state.gridSize = 7 + Math.floor(state.level / 2);
    state.steps = 0;
    state.lives = 3;
    stepsDisplay.innerText = state.steps;
    levelDisplay.innerText = state.level;
    updateLivesUI();
    generateMaze();
    renderMaze();
}

function generateMaze() {
    const size = state.gridSize;
    state.maze = Array(size).fill().map(() => Array(size).fill(0));
    let cx = 0, cy = 0;
    let path = [{x: 0, y: 0}];
    while(cx < size - 1 || cy < size - 1) {
        if(cx < size - 1 && (cy === size - 1 || Math.random() > 0.5)) cx++;
        else cy++;
        path.push({x: cx, y: cy});
    }
    for(let y=0; y<size; y++) {
        for(let x=0; x<size; x++) {
            if(path.some(p => p.x === x && p.y === y)) continue;
            if(Math.random() < 0.22) state.maze[y][x] = 1; 
        }
    }
    let trapCount = (state.difficulty === 'hard') ? size : (state.difficulty === 'normal' ? 3 : 1);
    let placed = 0;
    while(placed < trapCount) {
        let tx = Math.floor(Math.random() * size), ty = Math.floor(Math.random() * size);
        if(state.maze[ty][tx] === 0 && !(tx===0 && ty===0) && !(tx===size-1 && ty===size-1)) {
            state.maze[ty][tx] = 2; 
            placed++;
        }
    }
    state.player = { x: 0, y: 0 };
}

function renderMaze() {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
    const size = Math.min(300, window.innerWidth - 60);
    container.style.width = container.style.height = `${size}px`;
    for(let y=0; y<state.gridSize; y++) {
        for(let x=0; x<state.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if(state.maze[y][x] === 1) cell.classList.add('wall');
            if(state.maze[y][x] === 2) cell.classList.add('trap');
            if(x === state.player.x && y === state.player.y) cell.classList.add('player');
            if(x === state.gridSize-1 && y === state.gridSize-1) cell.classList.add('exit');
            container.appendChild(cell);
        }
    }
}

window.handleMove = (dx, dy) => {
    if(!overlay.classList.contains('hidden')) return;
    const nx = state.player.x + dx, ny = state.player.y + dy;
    if(nx >= 0 && nx < state.gridSize && ny >= 0 && ny < state.gridSize && state.maze[ny][nx] !== 1) {
        state.player = { x: nx, y: ny };
        state.steps++;
        stepsDisplay.innerText = state.steps;
        if(state.maze[ny][nx] === 2) hitTrap();
        else if(nx === state.gridSize - 1 && ny === state.gridSize - 1) {
            state.level++;
            setTimeout(loadLevel, 200);
        } else renderMaze();
    }
};

function hitTrap() {
    state.lives--;
    updateLivesUI();
    document.getElementById('game-card').classList.add('shake');
    setTimeout(() => {
        document.getElementById('game-card').classList.remove('shake');
        if(state.lives <= 0) endGame();
        else { state.player = { x: 0, y: 0 }; renderMaze(); }
    }, 400);
}

async function endGame() {
    overlay.classList.remove('hidden');
    overlay.classList.remove('height');
    window.goToStep('death');
    document.getElementById('save-status').innerText = "Збереження результату...";
    

    if (!firebaseReady || !db) {
        document.getElementById('save-status').innerText = "Firebase недоступний, результат локально не зберігається.";
        return;
    }

    if (user) {
        try {
            const leaderRef = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');
            await addDoc(leaderRef, {
                name: state.nickname,
                level: state.level,
                steps: state.steps,
                difficulty: state.difficulty,
                date: Date.now()
            });
            document.getElementById('save-status').innerText = "Результат збережено!";
        } catch (e) {
            document.getElementById('save-status').innerText = "Помилка збереження.";
            console.error(e);
        }
    }
}

function updateLivesUI() {
    livesDisplay.innerText = '❤️'.repeat(Math.max(0, state.lives));
}

window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if(k === 'w' || k === 'arrowup') handleMove(0, -1);
    if(k === 's' || k === 'arrowdown') handleMove(0, 1);
    if(k === 'a' || k === 'arrowleft') handleMove(-1, 0);
    if(k === 'd' || k === 'arrowright') handleMove(1, 0);
});

const resetBtn = document.querySelector('.reset');
resetBtn.onclick = function() {
    loadLevel()
}