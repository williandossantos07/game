// Elementos da Interface
const progressBar = document.getElementById('progress-bar');
const loadingText = document.getElementById('loading-text');
const loadingScreen = document.getElementById('loading-screen');
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameLoopId = null;

// Carregamento inicial
let progress = 0;
const messages = [
    "Carregando cenários...",
    "Preparando personagens...",
    "Espalhando armas pelo mapa...",
    "Pronto!"
];

const loadingInterval = setInterval(() => {
    progress += 2;
    if (progressBar) progressBar.style.width = progress + '%';

    if (progress === 30 && loadingText) loadingText.innerText = messages[0];
    if (progress === 60 && loadingText) loadingText.innerText = messages[1];
    if (progress === 85 && loadingText) loadingText.innerText = messages[2];

    if (progress >= 100) {
        clearInterval(loadingInterval);
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.opacity = '0';
            setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (mainMenu) mainMenu.style.display = 'flex';
            }, 500);
        }, 300);
    }
}, 40);

// Dados do Jogador Local
const player = {
    x: 400, y: 300, size: 15, speed: 4,
    color: '#3498db', name: 'Vortex', inventory: [], equipped: 'Nenhuma'
};

const regions = [
    { name: 'PICO DE OURO', x: 350, y: 80, width: 100, height: 40, color: '#3d3d3d' },
    { name: 'FÁBRICA', x: 100, y: 150, width: 120, height: 80, color: '#4a4a4a' },
    { name: 'TORRE DO RELÓGIO', x: 550, y: 380, width: 140, height: 60, color: '#5a4d41' },
    { name: 'ESTALEIRO', x: 600, y: 100, width: 120, height: 90, color: '#334e5a' },
    { name: 'VILA DO MAR', x: 120, y: 420, width: 110, height: 70, color: '#5a5533' }
];

let mapWeapons = [];

function resetWeapons() {
    mapWeapons = [
        { name: 'Pistola 9mm', x: 130, y: 450, color: '#f1c40f', collected: false },
        { name: 'M4A1-R', x: 140, y: 180, color: '#e67e22', collected: false },
        { name: 'AWM-Sniper', x: 390, y: 100, color: '#e74c3c', collected: false },
        { name: 'Doze Calibre 12', x: 620, y: 400, color: '#9b59b6', collected: false }
    ];
    player.inventory = [];
    player.equipped = 'Nenhuma';
    updateUI();
}

// Modais e Menu
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function selectCharacter(name, color, classType) {
    player.name = name;
    player.color = color;
    document.getElementById('name-display').innerText = name.toUpperCase();
    document.getElementById('avatar-display').innerText = name;
    document.getElementById('avatar-display').style.backgroundColor = color;
    document.getElementById('class-display').innerText = 'Classe: ' + classType;
    closeModal('char-modal');
}

function buyItem(itemName, cost) {
    const gemsElem = document.getElementById('gems-count');
    let gems = parseInt(gemsElem.innerText);
    if (gems >= cost) {
        gems -= cost;
        gemsElem.innerText = gems;
        alert('Você comprou: ' + itemName);
    } else {
        alert('Gemas insuficientes!');
    }
}

// Controles de Movimentação
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function startGame() {
    mainMenu.style.display = 'none';
    gameScreen.style.display = 'flex';
    resetWeapons();
    gameLoop();
}

function exitGame() {
    cancelAnimationFrame(gameLoopId);
    gameScreen.style.display = 'none';
    mainMenu.style.display = 'flex';
}

function update() {
    if ((keys['w'] || keys['arrowup']) && player.y - player.size > 0) { player.y -= player.speed; }
    if ((keys['s'] || keys['arrowdown']) && player.y + player.size < canvas.height) { player.y += player.speed; }
    if ((keys['a'] || keys['arrowleft']) && player.x - player.size > 0) { player.x -= player.speed; }
    if ((keys['d'] || keys['arrowright']) && player.x + player.size < canvas.width) { player.x += player.speed; }

    // Coleta de armas
    mapWeapons.forEach(weapon => {
        if (!weapon.collected) {
            const dist = Math.hypot(player.x - weapon.x, player.y - weapon.y);
            if (dist < player.size + 10) {
                weapon.collected = true;
                player.inventory.push(weapon.name);
                player.equipped = weapon.name;
                updateUI();
            }
        }
    });
}

function updateUI() {
    document.getElementById('current-weapon').innerText = player.equipped;
    document.getElementById('inventory-list').innerText = player.inventory.length > 0 ? player.inventory.join(', ') : 'Vazia';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o Mapa
    regions.forEach(region => {
        ctx.fillStyle = region.color;
        ctx.fillRect(region.x, region.y, region.width, region.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(region.name, region.x + region.width / 2, region.y + region.height / 2 + 4);
    });

    // Desenha Armas no chão
    mapWeapons.forEach(weapon => {
        if (!weapon.collected) {
            ctx.beginPath();
            ctx.arc(weapon.x, weapon.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = weapon.color;
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(weapon.name, weapon.x, weapon.y - 12);
        }
    });

    // Desenha o Jogador Local
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = '#00f0ff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x, player.y - 20);
}

function gameLoop() {
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}