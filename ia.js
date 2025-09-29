// ia.js - Funções de inteligência artificial da CPU

const ia = {
    decidirMelhorCarta: function(cartasCPU, usadaCPU, board, estadoDoJogo, dificuldade) {
        let melhorJogadaDeCarta = null;

        for (let i = 0; i < cartasCPU.length; i++) {
            if (!usadaCPU[i]) {
                const carta = cartasCPU[i];

                if (carta.tipo === 'anular' && estadoDoJogo.bloqueioAlvo === 'cpu') {
                    return { carta, cardIndex: i, targetCell: null };
                }

                if (carta.tipo === 'limpar') {
                    const alvoOfensivo = this.encontrarAlvoParaLimpezaVitoriosa(board);
                    if (alvoOfensivo !== null) return { carta, cardIndex: i, targetCell: alvoOfensivo };
                }
                
                const ameaca = this.encontrarJogadaVencedora('X', board);
                if (ameaca !== null) {
                    if (carta.tipo === 'limpar') {
                        const alvoDefensivo = this.encontrarAlvoParaLimpezaDefensiva('X', board);
                        if(alvoDefensivo !== null) melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: alvoDefensivo };
                    }
                    if (carta.tipo === 'protecao' && !melhorJogadaDeCarta) {
                        if(ameaca !== estadoDoJogo.jogadaPlanejada) melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: ameaca };
                    } else if (carta.tipo === 'forcar' && !melhorJogadaDeCarta) {
                        const alvo = this.decidirOndeForcarJogada(board, 'X', estadoDoJogo.jogadaPlanejada);
                        if (alvo !== null) melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: alvo };
                    }
                }

                if ((dificuldade === 'dificil' || dificuldade === 'extremo') && !melhorJogadaDeCarta) {
                    if (carta.tipo === 'protecao' && board[4] === '') {
                        melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: 4 };
                    } else if (carta.tipo === 'forcar') {
                        const lateraisVazias = [1, 3, 5, 7].filter(pos => board[pos] === '' && pos !== estadoDoJogo.jogadaPlanejada);
                        if (lateraisVazias.length > 0) {
                            const alvoProativo = lateraisVazias[Math.floor(Math.random() * lateraisVazias.length)];
                            melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: alvoProativo };
                        }
                    }
                }
            }
        }
        return melhorJogadaDeCarta;
    },

    encontrarAlvoParaLimpezaVitoriosa: function(board) {
        const pecasOponente = board.map((c, i) => (c === 'X' ? i : null)).filter(i => i !== null);
        for (const peca of pecasOponente) {
            const tempBoard = [...board];
            tempBoard[peca] = '';
            if (this.encontrarJogadaVencedora('O', tempBoard) !== null) return peca;
        }
        return null;
    },

    encontrarAlvoParaLimpezaDefensiva: function(oponente, board) {
        const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (const line of wins) {
            const [a, b, c] = line;
            const values = [board[a], board[b], board[c]];
            const opponentPieces = values.filter(v => v === oponente);
            const emptyCells = values.filter(v => v === '');

            if (opponentPieces.length === 2 && emptyCells.length === 1) {
                if (board[a] === oponente) return a;
                if (board[b] === oponente) return b;
            }
        }
        return null;
    },

    encontrarJogadaDeFork: function(player, board) {
        const celulasVazias = board.map((c, i) => (c === '' ? i : null)).filter(i => i !== null);

        for (const i of celulasVazias) {
            const boardTemporario = [...board];
            boardTemporario[i] = player;

            let ameacasCriadas = 0;
            const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
            for (const line of wins) {
                const [a, b, c] = line;
                const values = [boardTemporario[a], boardTemporario[b], boardTemporario[c]];
                const playerCount = values.filter(v => v === player).length;
                const emptyCount = values.filter(v => v === '').length;

                if (playerCount === 2 && emptyCount === 1) {
                    ameacasCriadas++;
                }
            }

            if (ameacasCriadas >= 2) {
                return i;
            }
        }
        return null;
    },

    // NOVA FUNÇÃO: Lógica para bloquear a tentativa de fork do oponente
    bloquearForkOponente: function(player, oponente, board) {
        // 1. Encontra a casa onde o oponente criaria um fork.
        const jogadaDeForkDoOponente = this.encontrarJogadaDeFork(oponente, board);

        if (jogadaDeForkDoOponente !== null) {
            // 2. A melhor defesa é um ataque. A IA pode criar uma ameaça para forçar o oponente a desistir do fork?
            const celulasVazias = board.map((c, i) => c === '' ? i : null).filter(i => i !== null);
            for (const i of celulasVazias) {
                const boardSimulado = [...board];
                boardSimulado[i] = player; // Simula a jogada da IA
                const jogadaVencedoraIA = this.encontrarJogadaVencedora(player, boardSimulado);

                // Se a IA puder criar uma ameaça, e o local para bloquear essa ameaça NÃO for o mesmo da jogada de fork do oponente,
                // então a IA força o oponente a se defender.
                if (jogadaVencedoraIA !== null && jogadaVencedoraIA !== jogadaDeForkDoOponente) {
                    return i; // Esta é uma jogada de contra-ataque.
                }
            }

            // 3. Se não houver um bom contra-ataque, a IA bloqueia o fork diretamente.
            return jogadaDeForkDoOponente;
        }

        return null;
    },

    analisarJogadaEstrategica: function(player, board, dificuldade) {
        const opponent = player === 'X' ? 'O' : 'X';

        // 1. Vencer
        const win = this.encontrarJogadaVencedora(player, board);
        if (win !== null) return win;
        
        // 2. Bloquear vitória iminente
        const block = this.encontrarJogadaVencedora(opponent, board);
        if (block !== null) return block;
        
        if (dificuldade === 'extremo') {
            // 3. Criar Fork (Ofensivo)
            const fork = this.encontrarJogadaDeFork(player, board);
            if (fork !== null) return fork;

            // 4. Bloquear Fork do Oponente (Defensivo)
            const blockFork = this.bloquearForkOponente(player, opponent, board);
            if (blockFork !== null) return blockFork;
        }

        return null;
    },

    encontrarJogadaVencedora: function(player, board) {
        const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (const line of wins) {
            const [a, b, c] = line;
            const values = [board[a], board[b], board[c]];
            const playerCount = values.filter(v => v === player).length;
            const emptyCount = values.filter(v => v === '').length;
            if (playerCount === 2 && emptyCount === 1) {
                if (board[a] === '') return a;
                if (board[b] === '') return b;
                if (board[c] === '') return c;
            }
        }
        return null;
    },

    decidirOndeForcarJogada: function(board, oponente, jogadaPlanejada) {
        const ameaca = this.encontrarJogadaVencedora(oponente, board);
        if (ameaca !== null) {
            const livres = board.map((c, i) => (c === '' ? i : null)).filter(i => i !== null);
            return livres.find(i => i !== ameaca && i !== jogadaPlanejada);
        }
        return null;
    }
};