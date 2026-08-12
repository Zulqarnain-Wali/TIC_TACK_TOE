(function () {
    'use strict';

    // ===== DOM refs =====
    const boardEl = document.getElementById('board');
    const messageEl = document.getElementById('message');
    const turnIndicator = document.getElementById('turnIndicator');
    const scoreXEl = document.getElementById('scoreX');
    const scoreOEl = document.getElementById('scoreO');
    const scoreDrawEl = document.getElementById('scoreDraw');
    const resetBtn = document.getElementById('resetBtn');
    const resetScoreBtn = document.getElementById('resetScoreBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loaderProgress = document.getElementById('loaderProgress');
    const loaderPercent = document.getElementById('loaderPercent');
    const loaderParticles = document.getElementById('loaderParticles');
    const gameWrapper = document.getElementById('gameWrapper');
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');

    // ===== Game state =====
    let board = Array(9).fill(null);
    let currentPlayer = 'X';
    let gameOver = false;
    let winner = null;
    let scores = { X: 0, O: 0, draw: 0 };

    const WIN_PATTERNS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    // ===== Theme =====
    const themes = ['dark', 'light', 'neon', 'pastel'];
    let currentThemeIndex = 0;

    function applyTheme(index) {
        const theme = themes[index];
        document.body.setAttribute('data-theme', theme);
        themeLabel.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
        // Store preference
        localStorage.setItem('tictactoe-theme', theme);
    }

    function cycleTheme() {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        applyTheme(currentThemeIndex);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('tictactoe-theme');
    if (savedTheme) {
        const idx = themes.indexOf(savedTheme);
        if (idx !== -1) {
            currentThemeIndex = idx;
            applyTheme(currentThemeIndex);
        }
    }

    themeToggle.addEventListener('click', cycleTheme);

    // ===== Loading animation =====
    function createParticles() {
        for (let i = 0; i < 30; i++) {
            const span = document.createElement('span');
            span.style.left = Math.random() * 100 + '%';
            span.style.top = Math.random() * 100 + '%';
            span.style.animationDuration = (2 + Math.random() * 3) + 's';
            span.style.animationDelay = (Math.random() * 2) + 's';
            span.style.width = (2 + Math.random() * 4) + 'px';
            span.style.height = span.style.width;
            const colors = ['#7c6df0', '#f0a87c', '#b7a4ff', '#ff9a8b'];
            span.style.background = colors[Math.floor(Math.random() * colors.length)];
            span.style.opacity = 0.3 + Math.random() * 0.5;
            loaderParticles.appendChild(span);
        }
    }
    createParticles();

    let loadProgress = 0;
    const progressSpeed = 0.8; // percent per frame

    function animateLoading() {
        if (loadProgress >= 100) {
            finishLoading();
            return;
        }
        loadProgress = Math.min(loadProgress + progressSpeed, 100);
        loaderProgress.style.transform = `rotate(${loadProgress * 3.6}deg)`;
        loaderPercent.textContent = Math.floor(loadProgress) + '%';
        requestAnimationFrame(animateLoading);
    }

    function finishLoading() {
        loadingOverlay.classList.add('hidden');
        gameWrapper.classList.add('visible');
        // Start game after loading
        resetGame();
    }

    // Start loading after a short delay for visual effect
    setTimeout(() => {
        animateLoading();
    }, 400);

    // ===== Render board =====
    function renderBoard() {
        boardEl.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (board[i] === 'X') {
                cell.classList.add('taken', 'x');
                cell.textContent = 'X';
            } else if (board[i] === 'O') {
                cell.classList.add('taken', 'o');
                cell.textContent = 'O';
            }
            cell.dataset.index = i;
            cell.addEventListener('click', () => handleCellClick(i));

            // Add mouse move tilt effect
            cell.addEventListener('mousemove', (e) => {
                if (cell.classList.contains('taken') || gameOver) return;
                const rect = cell.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                const tiltX = y * -8;
                const tiltY = x * 8;
                cell.style.transform =
                    `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
                cell.style.transition = 'none';
            });

            cell.addEventListener('mouseleave', () => {
                if (cell.classList.contains('taken') || gameOver) return;
                cell.style.transform = '';
                cell.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            });

            boardEl.appendChild(cell);
        }

        if (gameOver && winner && winner !== 'draw') {
            const winCells = getWinCells();
            if (winCells) {
                const cells = boardEl.children;
                const isOWin = winner === 'O';
                for (const idx of winCells) {
                    cells[idx].classList.add('win-highlight');
                    if (isOWin) cells[idx].classList.add('o-win');
                }
            }
        }

        updateTurnIndicator();
    }

    function getWinCells() {
        for (const pattern of WIN_PATTERNS) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return pattern;
            }
        }
        return null;
    }

    function checkGameStatus() {
        for (const pattern of WIN_PATTERNS) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                winner = board[a];
                gameOver = true;
                return true;
            }
        }
        if (board.every(cell => cell !== null)) {
            winner = 'draw';
            gameOver = true;
            return true;
        }
        return false;
    }

    function handleCellClick(index) {
        if (gameOver) return;
        if (board[index] !== null) return;

        board[index] = currentPlayer;
        const finished = checkGameStatus();

        if (finished) {
            if (winner === 'X') {
                scores.X += 1;
                messageEl.textContent = '🎉 Player X wins!';
                messageEl.className = 'message win';
            } else if (winner === 'O') {
                scores.O += 1;
                messageEl.textContent = '🎉 Player O wins!';
                messageEl.className = 'message win';
            } else if (winner === 'draw') {
                scores.draw += 1;
                messageEl.textContent = "🤝 It's a draw!";
                messageEl.className = 'message draw';
            }
            updateScores();
            renderBoard();
            updateTurnIndicator();
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        messageEl.textContent = `Player ${currentPlayer}'s turn`;
        messageEl.className = 'message';
        renderBoard();
    }

    function updateTurnIndicator() {
        if (gameOver) {
            if (winner === 'X') {
                turnIndicator.textContent = '🏆';
                turnIndicator.className = 'player-indicator x-turn';
            } else if (winner === 'O') {
                turnIndicator.textContent = '🏆';
                turnIndicator.className = 'player-indicator o-turn';
            } else if (winner === 'draw') {
                turnIndicator.textContent = '—';
                turnIndicator.className = 'player-indicator';
                turnIndicator.style.background = 'rgba(255,255,255,0.05)';
                turnIndicator.style.color = '#8a8aa0';
                turnIndicator.style.boxShadow = 'none';
            }
            return;
        }
        turnIndicator.style.background = '';
        turnIndicator.style.color = '';
        turnIndicator.style.boxShadow = '';
        turnIndicator.textContent = currentPlayer;
        turnIndicator.className = `player-indicator ${currentPlayer === 'X' ? 'x-turn' : 'o-turn'}`;
    }

    function updateScores() {
        scoreXEl.textContent = scores.X;
        scoreOEl.textContent = scores.O;
        scoreDrawEl.textContent = scores.draw;
    }

    function resetGame() {
        board = Array(9).fill(null);
        currentPlayer = 'X';
        gameOver = false;
        winner = null;
        messageEl.textContent = "Player X's turn";
        messageEl.className = 'message';
        turnIndicator.style.background = '';
        turnIndicator.style.color = '';
        turnIndicator.style.boxShadow = '';
        renderBoard();
        updateTurnIndicator();
    }

    function resetScores() {
        scores = { X: 0, O: 0, draw: 0 };
        updateScores();
        resetGame();
    }

    // ===== Event listeners =====
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScores);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                resetGame();
            }
        }
    });

    // ===== Initial render (will be called after loading) =====
    // The loading animation calls resetGame() when done.
    // For safety, also call it now if loading finishes quickly.
    // But we already call resetGame in finishLoading.
})();