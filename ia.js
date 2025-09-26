// ia.js - Funções de inteligência artificial da CPU

const ia = {
    decidirMelhorCarta: function(cartasCPU, usadaCPU, board, jogadaPlanejada, dificuldade) {
        let melhorJogadaDeCarta = null;

        for (let i = 0; i < cartasCPU.length; i++) {
            if (!usadaCPU[i]) {
                const carta = cartasCPU[i];

                // --- ESTRATÉGIAS OFENSIVAS ---
                if (carta.tipo === 'limpar') {
                    const alvoOfensivo = this.encontrarAlvoParaLimpezaVitoriosa(board);
                    if (alvoOfensivo !== null) return { carta, cardIndex: i, targetCell: alvoOfensivo };
                }
                
                // --- ESTRATÉGIAS DEFENSIVAS ---
                const ameaca = this.encontrarJogadaVencedora('X', board);
                if (ameaca !== null) {
                    if (carta.tipo === 'limpar') {
                        const alvoDefensivo = this.encontrarAlvoParaLimpezaDefensiva('X', board);
                        if(alvoDefensivo !== null) melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: alvoDefensivo };
                    }
                    if (carta.tipo === 'protecao' && !melhorJogadaDeCarta) {
                        if(ameaca !== jogadaPlanejada) melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: ameaca };
                    } else if (carta.tipo === 'forcar' && !melhorJogadaDeCarta) {
                        const alvo = this.decidirOndeForcarJogada(board, 'X', jogadaPlanejada);
                        if (alvo !== null) melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: alvo };
                    }
                }

                // --- ESTRATÉGIAS PROATIVAS (SOMENTE NO MODO DIFÍCIL) ---
                if (dificuldade === 'dificil' && !melhorJogadaDeCarta) {
                    if (carta.tipo === 'protecao' && board[4] === '') {
                        // Se o centro está livre, protegê-lo é uma jogada forte.
                        melhorJogadaDeCarta = { carta, cardIndex: i, targetCell: 4 };
                    } else if (carta.tipo === 'forcar') {
                        // Força o jogador para uma lateral (posição fraca)
                        const lateraisVazias = [1, 3, 5, 7].filter(pos => board[pos] === '' && pos !== jogadaPlanejada);
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

    analisarJogadaEstrategica: function(player, board) {
        const win = this.encontrarJogadaVencedora(player, board);
        if (win !== null) return win;
        
        const opponent = player === 'X' ? 'O' : 'X';
        const block = this.encontrarJogadaVencedora(opponent, board);
        if (block !== null) return block;
        
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