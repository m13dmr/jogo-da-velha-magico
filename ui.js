// ui.js - Gerencia a interface do usuário

console.log("ui.js carregado com sucesso!");

const infoDisplay = document.getElementById('info');
const placarX = document.getElementById('placarX');
const placarO = document.getElementById('placarO');
const placarE = document.getElementById('placarE');
const historicoEfeito = document.getElementById('historico-efeito');
const historyLog = document.getElementById('history-log');

window.tocarSom = function(idDoAudio) {
    const som = document.getElementById(idDoAudio);
    if (som) {
        som.currentTime = 0;
        som.play().catch(e => console.log("Erro ao tocar som:", e));
    }
}

window.initUI = function() {
    console.log("initUI ativado!");

    const menuInicial = document.getElementById('menu-inicial');
    const telaAjuda = document.getElementById('tela-ajuda');
    const gameContainer = document.getElementById('game-container');

    // --- LÓGICA DA TELA DE AJUDA ---
    document.getElementById('btn-ajuda').addEventListener('click', () => {
        menuInicial.style.display = 'none';
        telaAjuda.style.display = 'flex';
    });

    document.getElementById('btn-voltar-ajuda').addEventListener('click', () => {
        telaAjuda.style.display = 'none';
        menuInicial.style.display = 'flex';
    });

    const carregarCartasNaAjuda = () => {
        const container = document.getElementById('ajuda-lista-cartas');
        if(!container || typeof todasAsCartas === 'undefined') return;
        
        container.innerHTML = '';
        todasAsCartas.forEach(carta => {
            const itemCarta = document.createElement('div');
            itemCarta.className = 'ajuda-carta-item';
            
            itemCarta.innerHTML = `
                <strong>${carta.nome}</strong> (<em>${carta.raridade}</em>)<br>
                <span>${carta.desc}</span>
            `;
            container.appendChild(itemCarta);
        });
    };
    carregarCartasNaAjuda();
    // --- FIM DA LÓGICA DA TELA DE AJUDA ---

    document.getElementById('voltar-menu').addEventListener('click', () => {
        if (typeof resetPlacar === 'function') resetPlacar();
        gameContainer.style.display = 'none';
        menuInicial.style.display = 'flex';
    });

    document.getElementById('proximaRodada').addEventListener('click', () => window.continuar && continuar());
    document.getElementById('voltarMenuModal').addEventListener('click', () => window.voltarMenu && voltarMenu());

    document.querySelectorAll('#menu-inicial .button-group button').forEach(button => {
        button.addEventListener('click', (e) => {
            const dificuldade = e.target.getAttribute('data-dificuldade');
            if (window.iniciarJogo) iniciarJogo(dificuldade);
        });
    });

    const setupCardButton = (cardIndex) => {
        const arrayIndex = cardIndex - 1;
        document.getElementById(`cartaJogador${cardIndex}`).addEventListener('click', () => {
            if (!gameState.usada.jogador[arrayIndex] && gameState.currentPlayer === 'X') {
                flipCard('Jogador', cardIndex);
            }
        });

        document.getElementById(`btnUsarCarta${cardIndex}`).addEventListener('click', () => {
            if (gameState.usada.jogador[arrayIndex]) return updateInfo('Você já usou esta carta!');
            if (gameState.cartaUsadaNoTurno) return updateInfo('Você só pode usar uma carta por turno!');
            if (gameState.currentPlayer !== 'X') return updateInfo('Não é sua vez!');
            
            const carta = gameState.cartasJogador[arrayIndex];
            if (aplicarEfeitoCarta(carta, 'X')) {
                tocarSom('som-carta');
                gameState.usada.jogador[arrayIndex] = true;
                if (carta.tipo !== 'anular') gameState.cartaUsadaNoTurno = true;
                toggleAllPlayerButtons();
            }
        });
    };
    setupCardButton(1);
    setupCardButton(2);
};

window.adicionarAoHistorico = function(mensagem) {
    if (!historyLog) return;
    const novaEntrada = document.createElement('p');
    novaEntrada.textContent = mensagem;
    if (historyLog.childElementCount === 1 && historyLog.firstChild.textContent === 'Partida iniciada...') {
        historyLog.innerHTML = '';
    }
    historyLog.prepend(novaEntrada);
};

window.updateInfo = function(message) {
    infoDisplay.textContent = message;
};

window.updatePlacar = function(placar) {
    placarX.textContent = placar.X;
    placarO.textContent = placar.O;
    placarE.textContent = placar.E;
};

window.updateHistorico = function(nome, desc) {
    historicoEfeito.innerHTML = `<span>Último Efeito:</span> <b>${nome}</b> - ${desc}`;
};

window.showEndGame = function(message, winLine) {
    updateInfo(message);
    if (winLine) {
        winLine.forEach(index => {
            document.querySelector(`.cell[data-index='${index}']`)?.classList.add('winning-cell');
        });
    }
    document.getElementById('end-game-controls').style.display = 'flex';
};

window.toggleAllPlayerButtons = function() {
    toggleUsarButton(1);
    toggleUsarButton(2);
};

window.toggleUsarButton = function(cardIndex) {
    const btn = document.getElementById(`btnUsarCarta${cardIndex}`);
    if (!btn) return;

    const arrayIndex = cardIndex - 1;
    if (arrayIndex >= gameState.cartasJogador.length) {
        btn.style.display = 'none';
        return;
    }
    const carta = gameState.cartasJogador[arrayIndex];
    
    const isFlipped = document.getElementById(`cartaJogador${cardIndex}`).querySelector('.card').classList.contains('flipped');
    const cardUsed = gameState.usada.jogador[arrayIndex];
    const isForced = gameState.bloqueioAlvo === 'jogador';
    
    let show = false;
    if (isFlipped && !cardUsed) {
        if (carta.tipo === 'anular') {
            show = isForced;
        } else {
            show = !isForced && !gameState.cartaUsadaNoTurno;
        }
    }
    btn.style.display = show ? 'block' : 'none';
};

window.flipCard = function(owner, cardIndex) {
    const cardElement = document.getElementById(`carta${owner}${cardIndex}`);
    const card = cardElement.querySelector('.card');
    if (card && !card.classList.contains('flipped')) {
        tocarSom('som-carta');
        card.classList.add('flipped');
        if (owner === 'Jogador') toggleAllPlayerButtons();
    }
};

window.resetUI = function() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
    document.querySelector('.tabuleiro').style.pointerEvents = 'auto';
    document.getElementById('end-game-controls').style.display = 'none';

    for (let i = 1; i <= 2; i++) {
        const cardJogador = document.getElementById(`cartaJogador${i}`);
        const cardCPU = document.getElementById(`cartaCPU${i}`);
        if (cardJogador) cardJogador.querySelector('.card').classList.remove('flipped');
        if (cardCPU) cardCPU.querySelector('.card').classList.remove('flipped');
        
        const btn = document.getElementById(`btnUsarCarta${i}`);
        if(btn) btn.style.display = 'none';
    }
    
    if (historyLog) {
        historyLog.innerHTML = '<p>Partida iniciada...</p>';
    }
};

window.updateCardInfo = function(cardIndex, owner, nome, desc) {
    const cardName = document.getElementById(`carta-nome-${owner}${cardIndex}`);
    const cardNameBack = document.getElementById(`carta-nome-${owner}${cardIndex}-back`);
    const cardDesc = document.getElementById(`carta-desc-${owner}${cardIndex}`);

    if (cardName) cardName.textContent = '?';
    if (cardNameBack) cardNameBack.textContent = nome;
    if (cardDesc) cardDesc.textContent = desc;
};