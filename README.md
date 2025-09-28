# Jogo da Velha Mágico (v2.0)

Bem-vindo ao Jogo da Velha Mágico! Uma releitura estratégica do clássico Jogo da Velha, onde cada jogador possui cartas com habilidades únicas, e o próprio tabuleiro pode conter surpresas. Jogue contra uma IA com múltiplos níveis de dificuldade e teste sua capacidade de adaptação e estratégia.

## Funcionalidades Principais

- **Dois Modos de Jogo:** Escolha entre o **Modo Mágico**, com cartas e armadilhas, ou o **Modo Clássico**, para uma partida tradicional.
- **IA com Dificuldade Ajustável:** Desafie a CPU nos modos **Fácil**, **Médio** ou **Difícil**. A dificuldade afeta tanto a qualidade das jogadas quanto a estratégia de uso das cartas.
- **Sistema de Cartas Único (Modo Mágico):**
    - 4 tipos de cartas com efeitos distintos (Forçar, Proteger, Limpar, Anular).
    - 2 cartas por jogador a cada partida, com limite de 1 uso por turno.
- **Casa Armadilha Opcional:** Ative no menu de Configurações para que uma casa aleatória (?) apareça no tabuleiro com um de três efeitos surpresa:
    1.  **Limpar Tabuleiro:** Remove todas as outras peças do jogo.
    2.  **Embaralhar Jogadas:** Embaralha a posição de todas as peças existentes.
    3.  **Blefe:** Não faz nada.
- **Interface Completa:** Inclui placar, histórico de jogadas detalhado, tela de ajuda, menu de configurações e efeitos sonoros para uma experiência imersiva.

## Como Jogar

1.  **Menu Inicial:** Escolha entre "Modo Mágico" ou "Modo Clássico". Você também pode acessar a tela "Como Jogar?" ou "Configurações".
2.  **O Jogo:** O objetivo é conseguir 3 dos seus símbolos ('X' ou 'O') em linha. A cada turno, você pode primeiro usar uma carta (no Modo Mágico) e depois fazer sua jogada no tabuleiro.
3.  **Usando Cartas:**
    - Clique em uma de suas cartas para revelar seu efeito.
    - Clique no botão "Usar Carta" que aparecerá.
    - Siga as instruções na tela e, em seguida, faça sua jogada normal no tabuleiro.

## Lista de Cartas

| Nome               | Raridade | Efeito                                                                                   |
| ------------------ | -------- | ---------------------------------------------------------------------------------------- |
| **Jogada Forçada** | Rara     | Escolha uma casa vazia para forçar a próxima jogada do oponente nela.                    |
| **Proteção Divina** | Comum    | Protege uma casa vazia por 1 rodada do oponente. Ela estará livre no seu próximo turno.    |
| **Limpeza de Campo** | Épica    | Escolha uma peça do oponente no tabuleiro para removê-la permanentemente.                |
| **Liberdade Mental** | Rara     | Use esta carta quando sua jogada estiver forçada para anular o efeito e jogar livremente. |

## Como Executar Localmente

Para jogar, basta abrir o arquivo `index.html` em qualquer navegador de internet moderno (Chrome, Firefox, Edge, etc.).

---
*Projeto desenvolvido em colaboração com a IA do Google.*
