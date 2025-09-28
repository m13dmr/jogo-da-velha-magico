// cards.js - Gerencia as cartas e seus efeitos

console.log("cards.js carregado com sucesso!");

const todasAsCartas = [
  {
    nome: "Jogada Forçada",
    desc: "Escolha uma casa vazia para forçar a próxima jogada do oponente nela.",
    tipo: "forcar",
    raridade: "rara"
  },
  {
    nome: "Proteção Divina",
    desc: "Protege uma casa vazia por 1 rodada do oponente. Ela estará livre no seu próximo turno.",
    tipo: "protecao",
    raridade: "comum"
  },
  {
    nome: "Limpeza de Campo",
    desc: "Escolha uma peça do oponente no tabuleiro para removê-la permanentemente.",
    tipo: "limpar",
    raridade: "epica"
  },
  {
    nome: "Liberdade Mental",
    desc: "Use esta carta quando sua jogada estiver forçada para anular o efeito e jogar livremente.",
    tipo: "anular",
    raridade: "rara"
  }
];

window.sortearCarta = function() {
  const cartaSorteada = todasAsCartas[Math.floor(Math.random() * todasAsCartas.length)];
  return { ...cartaSorteada };
};

window.aplicarEfeitoCarta = function(carta, jogador) {
  switch (carta.tipo) {
    case 'forcar':
      return ativarEfeitoForcar(jogador);
    case 'protecao':
      return ativarEfeitoProtecao(jogador);
    case 'limpar':
      return ativarEfeitoLimpar(jogador);
    case 'anular':
      return ativarEfeitoAnular(jogador);
    default:
      return false;
  }
};

function ativarEfeitoForcar(jogador) {
  if (jogador === 'X') {
    gameState.bloqueioMode = true;
    gameState.bloqueioAlvo = 'cpu';
    updateInfo('Selecione uma casa VAZIA para forçar a jogada da CPU!');
    return true;
  }
  return false;
}

function ativarEfeitoProtecao(jogador) {
    if (jogador === 'X') {
        gameState.protecaoMode = true;
        updateInfo('Selecione uma casa VAZIA para proteger!');
        return true;
    }
    return false;
}

function ativarEfeitoLimpar(jogador) {
    if (jogador === 'X') {
        gameState.limparMode = true;
        updateInfo('Escolha uma PEÇA DO OPONENTE para remover!');
        return true;
    }
    return false;
}

function ativarEfeitoAnular(jogador) {
    if (jogador === 'X') {
        if (gameState.bloqueioAlvo === 'jogador' && gameState.forcedMoveIndex !== null) {
            const cells = document.querySelectorAll('.cell');
            cells[gameState.forcedMoveIndex].classList.remove('forced-move');
            
            gameState.forcedMoveIndex = null;
            gameState.bloqueioAlvo = null;
            
            updateInfo('Bloqueio anulado! Você está livre para jogar.');
            adicionarAoHistorico("Jogador usou Liberdade Mental!");
            
            // Força a atualização da UI para reabilitar os botões
            toggleAllPlayerButtons();
            
            return true;
        } else {
            updateInfo('Você só pode usar esta carta quando sua jogada estiver forçada!');
            return false;
        }
    }
    return false;
}