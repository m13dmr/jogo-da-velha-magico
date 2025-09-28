// game.js - Gerencia o estado e a lógica principal do jogo

console.log("game.js carregado com sucesso!");

const gameState = {
    currentPlayer: 'X',
    primeiraPartida: true,
    modoDeJogo: 'magico',
    armadilhaAtivada: true,
    trapCellIndex: null,
    tipoDeArmadilha: null,
    forcedMoveIndex: null,
    bloqueioMode: false,
    bloqueioAlvo: null,
    protecaoMode: false,
    limparMode: false,
    placar: { X: 0, O: 0, E: 0 },
    protecaoIndex: null,
    protecaoExpiraPara: null,
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

window.iniciarJogo = function(dificuldade, modo = 'magico') {
    resetGame();
    
    gameState.nivelDificuldade = dificuldade;
    gameState.modoDeJogo = modo;
    
    document.getElementById('tela-dificuldade').style.display = 'none';
    document.getElementById('menu-inicial').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    
    initBoard();

    if (gameState.modoDeJogo === 'magico') {
        mostrarPaineisDeCartas(true);
        gameState.cartasJogador.push(sortearCarta(), sortearCarta());
        gameState.cartasCPU.push(sortearCarta(), sortearCarta());

        for (let i = 0; i < 2; i++) {
            updateCardInfo(i + 1, 'Jogador', gameState.cartasJogador[i].nome, gameState.cartasJogador[i].desc);
            updateCardInfo(i + 1, 'CPU', gameState.cartasCPU[i].nome, gameState.cartasCPU[i].desc);
            document.getElementById(`cartaJogador${i+1}`).className = `card-container ${gameState.cartasJogador[i].raridade}`;
            document.getElementById(`cartaCPU${i+1}`).className = `card-container ${gameState.cartasCPU[i].raridade}`;
        }
    } else {
        mostrarPaineisDeCartas(false);
    }

    const tabuleiro = document.querySelector('.tabuleiro');
    tabuleiro.style.pointerEvents = 'none';

    const comecarPartida = () => {
        const startMessage = gameState.currentPlayer === 'X' ? 'Você começa!' : 'A CPU começa!';
        updateInfo(startMessage);
        adicionarAoHistorico(`--- Nova Partida (${modo}, ${dificuldade}) ---`);
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
    iniciarJogo(gameState.nivelDificuldade, gameState.modoDeJogo);
};

window.voltarMenu = function() {
    resetGame();
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('menu-inicial').style.display = 'flex';
    updatePlacar(gameState.placar);
};

function initBoard() {
    const board = document.querySelector('.tabuleiro');
    board.innerHTML = '';
    
    if (gameState.armadilhaAtivada) {
        gameState.trapCellIndex = Math.floor(Math.random() * 9);
        const tiposDeArmadilha = [
            { tipo: 'limpar', peso: 50 },
            { tipo: 'embaralhar', peso: 35 },
            { tipo: 'nada', peso: 15 }
        ];
        const totalPeso = tiposDeArmadilha.reduce((soma, armadilha) => soma + armadilha.peso, 0);
        let numeroSorteado = Math.random() * totalPeso;
        for (const armadilha of tiposDeArmadilha) {
            if (numeroSorteado < armadilha.peso) {
                gameState.tipoDeArmadilha = armadilha.tipo;
                break;
            }
            numeroSorteado -= armadilha.peso;
        }
    } else {
        gameState.trapCellIndex = null;
        gameState.tipoDeArmadilha = null;
    }
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        
        if (i === gameState.trapCellIndex) {
            cell.classList.add('trap-cell');
            cell.innerHTML = '<span>?</span>';
        }

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
    gameState.trapCellIndex = null;
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

function ativarArmadilhaLimparTabuleiro() {
    adicionarAoHistorico("ARMADILHA! O tabuleiro foi limpo!");
    updateInfo("ARMADILHA! O tabuleiro foi limpo!");
    
    setTimeout(() => {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            if (index !== gameState.trapCellIndex) {
                cell.innerHTML = '';
                cell.classList.remove('player-X', 'player-O');
            }
        });
        gameState.trapCellIndex = null;
        nextTurn();
    }, 1200);
}

function ativarArmadilhaEmbaralhar() {
    adicionarAoHistorico("ARMADILHA! As peças foram embaralhadas!");
    updateInfo("ARMADILHA! As peças foram embaralhadas!");
    
    setTimeout(() => {
        const cells = document.querySelectorAll('.cell');
        let pecas = [];
        let posicoes = [];

        cells.forEach((cell, index) => {
            if (cell.textContent.trim()) {
                pecas.push(cell.textContent.trim());
                posicoes.push(index);
                cell.innerHTML = '';
                cell.classList.remove('player-X', 'player-O');
            }
        });

        for (let i = posicoes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [posicoes[i], posicoes[j]] = [posicoes[j], posicoes[i]];
        }

        pecas.forEach((peca, i) => {
            const novaPosicao = posicoes[i];
            cells[novaPosicao].innerHTML = `<span class="player-${peca}">${peca}</span>`;
            cells[novaPosicao].classList.add(`player-${peca}`);
        });

        gameState.trapCellIndex = null;

        const vitoriaX = checkWin('X');
        const vitoriaO = checkWin('O');
        
        if (vitoriaX && vitoriaO) {
            const vencedor = gameState.currentPlayer;
            const msgVencedor = vencedor === 'X' ? 'Jogador X venceu!' : 'CPU O venceu!';
            const linhaVencedora = vencedor === 'X' ? vitoriaX : vitoriaO;
            adicionarAoHistorico(`Vitória dupla! ${msgVencedor} por ativar a armadilha!`);
            endGame(msgVencedor, linhaVencedora);
        } else if (vitoriaX) {
            endGame('Jogador X venceu!', vitoriaX);
        } else if (vitoriaO) {
            endGame('CPU O venceu!', vitoriaO);
        } else {
            nextTurn();
        }
    }, 1200);
}

window.handleCellClick = function(idx) {
    const cells = document.querySelectorAll('.cell');
    if (gameState.currentPlayer === 'O') return;

    const eArmadilha = (idx === gameState.trapCellIndex);

    if (gameState.modoDeJogo === 'magico') {
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
        
        if ((gameState.bloqueioAlvo === 'cpu' && idx === gameState.forcedMoveIndex)) {
            return updateInfo('Casa inválida!');
        }
    }
    
    if (cells[idx].textContent && !eArmadilha) {
        return updateInfo('Casa já ocupada!');
    }
    if (cells[idx].classList.contains('protected')) {
        return updateInfo('Casa inválida!');
    }

    cells[idx].innerHTML = `<span class="player-X">X</span>`;
    adicionarAoHistorico(`Jogador X jogou na casa #${idx + 1}.`);
    tocarSom('som-jogada');

    const winLine = checkWin('X');
    if (winLine) {
        return endGame('Jogador X venceu!', winLine);
    }

    if (eArmadilha) {
        cells[idx].classList.remove('trap-cell');
        if (gameState.tipoDeArmadilha === 'limpar') {
            ativarArmadilhaLimparTabuleiro();
        } else if (gameState.tipoDeArmadilha === 'embaralhar') {
            ativarArmadilhaEmbaralhar();
        } else if (gameState.tipoDeArmadilha === 'nada') {
            adicionarAoHistorico("ARMADILHA! Era um blefe, nada aconteceu.");
            updateInfo("ARMADILHA! Era um blefe, nada aconteceu.");
            gameState.trapCellIndex = null;
            nextTurn();
        }
        return; 
    }

    if (gameState.modoDeJogo === 'magico' && gameState.bloqueioAlvo === 'jogador') {
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
    
    const cells = document.querySelectorAll('.cell');
    const celulasJogaveis = Array.from(cells).filter(cell => {
        const isOccupied = cell.textContent.trim() !== '';
        const isTrap = cell.classList.contains('trap-cell');
        const isProtected = cell.classList.contains('protected');
        return !(isOccupied && !isTrap) && !isProtected;
    });

    if (celulasJogaveis.length === 0) {
        return endGame('Empate!');
    }
    
    if (celulasJogaveis.length === 1 && celulasJogaveis[0].classList.contains('trap-cell')) {
        const proximoJogador = player === 'X' ? 'O' : 'X';
        updateInfo(`Última jogada! ${proximoJogador} é forçado(a) a jogar na armadilha!`);
        adicionarAoHistorico(`Jogo forçado na armadilha!`);
        if (proximoJogador === 'X') {
            gameState.bloqueioAlvo = 'jogador';
            gameState.forcedMoveIndex = gameState.trapCellIndex;
            cells[gameState.trapCellIndex].classList.add('forced-move');
        }
    }
    
    gameState.currentPlayer = player === 'X' ? 'O' : 'X';
    gameState.cartaUsadaNoTurno = false;
    
    if (gameState.modoDeJogo === 'magico') {
        verificarExpiracaoEfeitos();
    }
    
    updateInfo(`Vez do jogador ${gameState.currentPlayer}`);

    const tabuleiro = document.querySelector('.tabuleiro');
    if (gameState.currentPlayer === 'O') {
        tabuleiro.style.pointerEvents = 'none';
        setTimeout(turnoCPU, 1000);
    } else {
        tabuleiro.style.pointerEvents = 'auto';
        if (gameState.modoDeJogo === 'magico') {
            toggleAllPlayerButtons();
        }
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

            const winLineCPU = checkWin('O');
            if (winLineCPU) {
                return endGame('CPU O venceu!', winLineCPU);
            }

            if (jogada === gameState.trapCellIndex) {
                cells[jogada].classList.remove('trap-cell');
                if (gameState.tipoDeArmadilha === 'limpar') {
                    ativarArmadilhaLimparTabuleiro();
                } else if (gameState.tipoDeArmadilha === 'embaralhar') {
                    ativarArmadilhaEmbaralhar();
                } else if (gameState.tipoDeArmadilha === 'nada') {
                    adicionarAoHistorico("ARMADILHA! Era um blefe, nada aconteceu.");
                    updateInfo("ARMADILHA! Era um blefe, nada aconteceu.");
                    gameState.trapCellIndex = null;
                    nextTurn();
                }
                return;
            }
        } else {
            adicionarAoHistorico(`CPU O não pôde jogar.`);
        }
        nextTurn();
    };

    const celulasJogaveis = Array.from(cells).filter(cell => {
        const isOccupied = cell.textContent.trim() !== '';
        const isTrap = cell.classList.contains('trap-cell');
        const isProtected = cell.classList.contains('protected');
        return !(isOccupied && !isTrap) && !isProtected;
    });

    if (celulasJogaveis.length === 1 && celulasJogaveis[0].classList.contains('trap-cell')) {
        jogada = gameState.trapCellIndex;
        executarJogada();
        return;
    }

    if (gameState.modoDeJogo === 'magico' && gameState.bloqueioAlvo === 'cpu' && gameState.forcedMoveIndex !== null) {
        jogada = gameState.forcedMoveIndex;
        cells[jogada].classList.remove('forced-move');
        gameState.forcedMoveIndex = null;
        gameState.bloqueioAlvo = null;
        executarJogada();
        return;
    }

    let usouCarta = false;
    if (gameState.modoDeJogo === 'magico') {
        const chanceDeUsarCarta = { facil: 0.2, medio: 0.6, dificil: 1.0 };
        if (!gameState.cartaUsadaNoTurno && Math.random() < chanceDeUsarCarta[gameState.nivelDificuldade]) {
            const melhorJogadaDeCarta = ia.decidirMelhorCarta(gameState.cartasCPU, gameState.usada.cpu, board, null, gameState.nivelDificuldade);
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
    }
    
    const chanceDeJogadaAleatoria = { facil: 0.75, medio: 0, dificil: 0 };
    let jogadaEstrategica = (Math.random() < chanceDeJogadaAleatoria[gameState.nivelDificuldade]) ? null : (ia.analisarJogadaEstrategica('O', board) ?? ia.analisarJogadaEstrategica('X', board));

    const ameaca = ia.encontrarJogadaVencedora('X', board);
    if (ameaca !== null && jogadaEstrategica !== ameaca && gameState.trapCellIndex !== null && !cells[gameState.trapCellIndex].textContent) {
        adicionarAoHistorico("CPU está em apuros e arrisca na armadilha!");
        jogadaEstrategica = gameState.trapCellIndex;
    }

    if (jogadaEstrategica !== null && (cells[jogadaEstrategica].classList.contains('protected') || cells[jogadaEstrategica].classList.contains('forced-move'))) {
        jogada = null;
    } else {
        jogada = jogadaEstrategica;
    }
    
    if (jogada === null) {
        const livres = board.map((c, i) => !c && !cells[i].classList.contains('protected') && !cells[i].classList.contains('forced-move') && i !== gameState.trapCellIndex ? i : null).filter(v => v !== null);
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
        modoDeJogo: 'magico',
        armadilhaAtivada: gameState.armadilhaAtivada,
        trapCellIndex: null,
        tipoDeArmadilha: null,
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