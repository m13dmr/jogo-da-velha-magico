// estado.js - Armazena o estado atual do jogo

const gameState = {
    currentPlayer: 'X',
    primeiraPartida: true,
    modoDeJogo: 'magico',
    armadilhaAtivada: false,
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