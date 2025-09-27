// game.js - Gerencia o estado e a lógica principal do jogo

console.log("game.js carregado com sucesso!");

const gameState = {
    currentPlayer: 'X',
    primeiraPartida: true,
    forcedMoveIndex: null,
    bloqueioMode: false,
    bloqueioAlvo: null,
    protecaoMode: false,
    limparMode: false,
    placar: { X: 0, O: 0, E: 0 },
    protecaoIndex: null,
    protecaoExpiraPara: null, // Substitui o contador de turnos
    nivelDificuldade: 'facil',
    cartasJogador: [],
    cartasCPU: [],
    usada: { jogador: [false, false], cpu: [false, false] },
    cartaUsadaNoTurno: false
};

window.resetPlacar = function() {
    gameState.placar = { X: 0, O: 0, E: 0 };
    gameState.primeiraPartida = true;
    updatePlacar(gameState.placar);
};

window.iniciarJogo = function(dificuldade) {
    gameState.nivelDificuldade = dificuldade;
    document.getElementById('menu-inicial').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    
    resetGame();
    initBoard();

    gameState.cartasJogador.push(sortearCarta(), sortearCarta());
    gameState.cartasCPU.push(sortearCarta(), sortearCarta());

    for (let i = 0; i < 2; i++) {
        updateCardInfo(i + 1, 'Jogador', gameState.cartasJogador[i].nome, gameState.cartasJogador[i].desc);
        updateCardInfo(i + 1, 'CPU', gameState.cartasCPU[i].nome, gameState.cartasCPU[i].desc);
        document.getElementById(`cartaJogador${i+1}`).className = `card-container ${gameState.cartasJogador[i].raridade}`;
        document.getElementById(`cartaCPU${i+1}`).className = `card-container ${gameState.cartasCPU[i].raridade}`;
    }

    const tabuleiro = document.querySelector('.tabuleiro');
    tabuleiro.style.pointerEvents = 'none';

    const comecarPartida = () => {
        const startMessage = gameState.currentPlayer === 'X' ? 'Você começa!' : 'A CPU começa!';
        updateInfo(startMessage);
        adicionarAoHistorico(`--- Nova Partida (${dificuldade}) ---`);
        adicionarAoHistorico(startMessage);
        
        setTimeout(() => {
            updateInfo(`Vez do jogador ${gameState.currentPlayer}`);
            if (gameState.currentPlayer === 'O') {
                turnoCPU();
            } else {
                tabuleiro.style.pointerEvents = 'auto';
            }
        }, 1200);
    };

    if (gameState.primeiraPartida) {
        updateInfo('Sorteando jogador inicial...');
        setTimeout(() => {
            const quemComeca = ['X', 'O'][Math.floor(Math.random() * 2)];
            gameState.currentPlayer = quemComeca;
            gameState.primeiraPartida = false;
            comecarPartida();
        }, 1500);
    } else {
        gameState.currentPlayer = 'X';
        comecarPartida();
    }
};

window.continuar = function() {
    iniciarJogo(gameState.nivelDificuldade);
};

window.voltarMenu = function() {
    resetGame();
    document.getElementById('menu-inicial').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    updatePlacar(gameState.placar);
};

function initBoard() {
    const board = document.querySelector('.tabuleiro');
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => handleCellClick(i));
        board.appendChild(cell);
    }
}

function checkWin(p) {
    const board = Array.from(document.querySelectorAll('.cell')).map(cell => cell.textContent.trim());
    const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (const line of wins) {
        if (line.every(i => board[i] === p)) return line;
    }
    return null;
}

function checkDraw() {
    return Array.from(document.querySelectorAll('.cell')).every(c => c.textContent || c.classList.contains('protected'));
}

function endGame(msg, winLine = null) {
    if (msg.includes('venceu')) {
        gameState.placar[msg.includes('Jogador X') ? 'X' : 'O']++;
        if (msg.includes('Jogador X')) {
            tocarSom('som-vitoria');
        } else {
            tocarSom('som-derrota');
        }
    }
    updatePlacar(gameState.placar);
    showEndGame(msg, winLine);
    adicionarAoHistorico(`Fim de jogo: ${msg}`);
    document.querySelector('.tabuleiro').style.pointerEvents = 'none';
}

function verificarExpiracaoEfeitos() {
    if (gameState.protecaoIndex !== null && gameState.protecaoExpiraPara === gameState.currentPlayer) {
        document.querySelectorAll('.cell')[gameState.protecaoIndex].classList.remove('protected');
        adicionarAoHistorico(`Proteção na casa #${gameState.protecaoIndex + 1} expirou.`);
        gameState.protecaoIndex = null;
        gameState.protecaoExpiraPara = null;
    }
}

window.handleCellClick = function(idx) {
    const cells = document.querySelectorAll('.cell');
    if (gameState.currentPlayer === 'O') return;

    if (gameState.limparMode) {
        if (cells[idx].textContent.trim() === 'O') {
            cells[idx].innerHTML = '';
            gameState.limparMode = false;
            updateInfo('Peça removida! Agora, faça a sua jogada.');
            adicionarAoHistorico(`Jogador usou Limpeza de Campo na casa #${idx + 1}.`);
        } else {
            updateInfo('Escolha uma PEÇA DO OPONENTE para remover!');
        }
        return;
    }

    if (gameState.protecaoMode) {
        if (!cells[idx].textContent) {
            cells[idx].classList.add('protected');
            gameState.protecaoIndex = idx;
            gameState.protecaoExpiraPara = gameState.currentPlayer;
            gameState.protecaoMode = false;
            updateInfo('Casa protegida! Agora, faça a sua jogada.');
            adicionarAoHistorico(`Jogador usou Proteção Divina na casa #${idx + 1}.`);
        } else {
            updateInfo('Escolha uma casa VAZIA para proteger!');
        }
        return;
    }
    
    if (gameState.bloqueioMode) {
        if (!cells[idx].textContent) {
            cells[idx].classList.add('forced-move');
            gameState.forcedMoveIndex = idx;
            gameState.bloqueioMode = false;
            updateInfo('Casa forçada selecionada. Agora, faça a sua jogada.');
            adicionarAoHistorico(`Jogador usou Jogada Forçada na casa #${idx + 1}.`);
        } else {
            updateInfo('Escolha uma casa VAZIA para forçar a jogada da CPU!');
        }
        return;
    }

    if (gameState.bloqueioAlvo === 'jogador' && idx !== gameState.forcedMoveIndex) {
        return updateInfo('Sua jogada foi forçada! Jogue na casa destacada.');
    }
    
    if (cells[idx].textContent || (gameState.bloqueioAlvo === 'cpu' && idx === gameState.forcedMoveIndex) || cells[idx].classList.contains('protected')) {
        return updateInfo('Casa inválida!');
    }

    cells[idx].innerHTML = `<span class="player-X">X</span>`;
    adicionarAoHistorico(`Jogador X jogou na casa #${idx + 1}.`);
    tocarSom('som-jogada');

    if (gameState.bloqueioAlvo === 'jogador') {
        cells[gameState.forcedMoveIndex].classList.remove('forced-move');
        gameState.forcedMoveIndex = null;
        gameState.bloqueioAlvo = null;
    }
    
    nextTurn();
};

function nextTurn() {
    const player = gameState.currentPlayer;
    
    const winLine = checkWin(player);
    if (winLine) {
        return endGame(player === 'X' ? 'Jogador X venceu!' : 'CPU O venceu!', winLine);
    }
    if (checkDraw()) {
        return endGame('Empate!');
    }
    
    gameState.currentPlayer = player === 'X' ? 'O' : 'X';
    gameState.cartaUsadaNoTurno = false;
    
    verificarExpiracaoEfeitos(); // Verifica expiração no início do novo turno
    
    updateInfo(`Vez do jogador ${gameState.currentPlayer}`);

    const tabuleiro = document.querySelector('.tabuleiro');
    if (gameState.currentPlayer === 'O') {
        tabuleiro.style.pointerEvents = 'none';
        setTimeout(turnoCPU, 1000);
    } else {
        tabuleiro.style.pointerEvents = 'auto';
        toggleAllPlayerButtons();
    }
}

function turnoCPU() {
    const cells = document.querySelectorAll('.cell');
    let board = Array.from(cells).map(c => c.textContent.trim());
    let jogada = null;

    const executarJogada = () => {
        if (jogada !== null) {
            cells[jogada].innerHTML = `<span class="player-O">O</span>`;
            tocarSom('som-jogada');
            adicionarAoHistorico(`CPU O jogou na casa #${jogada + 1}.`);
        } else {
            adicionarAoHistorico(`CPU O não pôde jogar.`);
        }
        nextTurn();
    };

    if (gameState.bloqueioAlvo === 'cpu' && gameState.forcedMoveIndex !== null) {
        jogada = gameState.forcedMoveIndex;
        cells[jogada].classList.remove('forced-move');
        gameState.forcedMoveIndex = null;
        gameState.bloqueioAlvo = null;
        executarJogada();
        return;
    }

    let usouCarta = false;
    const chanceDeUsarCarta = { facil: 0.2, medio: 0.6, dificil: 1.0 };
    if (!gameState.cartaUsadaNoTurno && Math.random() < chanceDeUsarCarta[gameState.nivelDificuldade]) {
        const melhorJogadaDeCarta = ia.decidirMelhorCarta(gameState.cartasCPU, gameState.usada.cpu, board);
        if (melhorJogadaDeCarta) {
            const { carta, cardIndex, targetCell } = melhorJogadaDeCarta;
            usouCarta = true;
            
            updateInfo(`CPU usou ${carta.nome}!`);
            adicionarAoHistorico(`CPU usou ${carta.nome}!`);
            
            switch(carta.tipo) {
                case 'limpar':
                    cells[targetCell].innerHTML = '';
                    break;
                case 'protecao':
                    cells[targetCell].classList.add('protected');
                    gameState.protecaoIndex = targetCell;
                    gameState.protecaoExpiraPara = 'O';
                    break;
                case 'forcar':
                    cells[targetCell].classList.add('forced-move');
                    gameState.bloqueioAlvo = 'jogador';
                    gameState.forcedMoveIndex = targetCell;
                    break;
            }
            
            gameState.usada.cpu[cardIndex] = true;
            gameState.cartaUsadaNoTurno = true;
            flipCard('CPU', cardIndex + 1);
            board = Array.from(cells).map(c => c.textContent.trim());
        }
    }
    
    const chanceDeJogadaAleatoria = { facil: 0.75, medio: 0, dificil: 0 };
    if (Math.random() < chanceDeJogadaAleatoria[gameState.nivelDificuldade]) {
        jogada = null;
    } else {
        jogada = ia.analisarJogadaEstrategica('O', board) ?? ia.analisarJogadaEstrategica('X', board);
    }

    if (jogada !== null && (cells[jogada].classList.contains('protected') || cells[jogada].classList.contains('forced-move'))) {
        jogada = null;
    }
    if (jogada === null) {
        const livres = board.map((c, i) => !c && !cells[i].classList.contains('protected') && !cells[i].classList.contains('forced-move') ? i : null).filter(v => v !== null);
        if (livres.length > 0) {
            jogada = livres[Math.floor(Math.random() * livres.length)];
        }
    }
    
    if (usouCarta) {
        setTimeout(executarJogada, 1500);
    } else {
        executarJogada();
    }
}

function resetGame() {
    Object.assign(gameState, {
        currentPlayer: 'X',
        primeiraPartida: gameState.primeiraPartida,
        forcedMoveIndex: null,
        bloqueioMode: false,
        bloqueioAlvo: null,
        protecaoMode: false,
        limparMode: false,
        protecaoIndex: null,
        protecaoExpiraPara: null,
        cartasJogador: [],
        cartasCPU: [],
        usada: { jogador: [false, false], cpu: [false, false] },
        cartaUsadaNoTurno: false
    });
    resetUI();
    updateHistorico('Nenhum', '-');
}