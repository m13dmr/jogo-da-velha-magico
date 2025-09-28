// armadilha.js - Gerencia os efeitos da casa armadilha

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
    }, 1000);
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
        }
    }, 1000);
}