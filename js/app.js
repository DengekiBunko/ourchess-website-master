/**
 * 国际象棋应用程序
 * 集成引擎、棋盘UI和AI
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化游戏引擎
    const engine = new ChessEngine();
    
    // 初始化AI
    const ai = new ChessAI('medium');
    
    // 初始化棋盘UI
    const boardElement = document.getElementById('chessboard');
    const chessboard = new ChessboardUI(boardElement, {
        draggable: true,
        showLegalMoves: true,
        onPieceClick: handlePieceClick,
        onSquareClick: handleSquareClick,
        onMove: handleMove
    });
    
    // 游戏状态
    let gameMode = 'two-player'; // 'two-player' 或 'ai'
    let selectedPiece = null;
    let legalMoves = [];
    let isAIThinking = false;
    
    // 更新棋盘
    updateUI();
    
    // 设置事件监听器
    document.getElementById('two-player-mode').addEventListener('click', setTwoPlayerMode);
    document.getElementById('ai-mode').addEventListener('click', setAIMode);
    document.getElementById('new-game').addEventListener('click', newGame);
    document.getElementById('undo-move').addEventListener('click', undoMove);
    document.getElementById('play-again').addEventListener('click', newGame);
    
    // AI难度选择
    document.getElementById('ai-difficulty').addEventListener('change', function() {
        ai.setDifficulty(this.value);
    });
    
    // 设置升变模态框事件
    setupPromotionModal();
    
    /**
     * 处理棋子点击事件
     */
    /**
     * 处理棋子点击事件
     */
    function handlePieceClick(row, col, piece) {
        // 如果AI正在思考或正在回放，不允许操作
        if (isAIThinking || isReplayActive) return;
        
        // 如果是AI模式且当前是AI的回合，不允许操作
        if (gameMode === 'ai' && engine.currentPlayer === 'b') return;
        
        // 检查是否是当前玩家的棋子
        const pieceColor = engine.getPieceColor(piece);
        if (pieceColor !== engine.currentPlayer) {
            // 如果已经选中了我方棋子，并且点击的是对方棋子，尝试吃子
            if (selectedPiece) {
                const [fromRow, fromCol] = selectedPiece;
                if (engine.isValidMove(fromRow, fromCol, row, col)) {
                    executeMove(fromRow, fromCol, row, col);
                    return;
                }
            }
            return;
        }
        
        // 选择棋子
        selectedPiece = [row, col];
        chessboard.selectPiece(row, col);
        
        // 计算合法移动
        legalMoves = calculateLegalMoves(row, col);
        
        // 高亮显示合法移动
        chessboard.highlightLegalMoves(legalMoves);
    }
    
    /**
     * 处理方格点击事件
     */
    /**
     * 处理方格点击事件
     */
    function handleSquareClick(row, col) {
        // 如果AI正在思考或正在回放，不允许操作
        if (isAIThinking || isReplayActive) return;
        
        // 如果是AI模式且当前是AI的回合，不允许操作
        if (gameMode === 'ai' && engine.currentPlayer === 'b') return;
        
        // 如果没有选中棋子，不做任何处理
        if (!selectedPiece) return;
        
        // 如果点击了选中棋子的当前位置，取消选择
        if (selectedPiece[0] === row && selectedPiece[1] === col) {
            chessboard.clearSelection();
            selectedPiece = null;
            legalMoves = [];
            return;
        }
        
        // 获取目标位置的棋子
        const targetPiece = engine.getPiece(row, col);
        
        // 检查移动是否合法
        if (!isMoveLegal(row, col)) {
            // 如果移动不合法，但目标位置有对方的棋子，可能是想吃子
            if (targetPiece && engine.getPieceColor(targetPiece) !== engine.currentPlayer) {
                const [fromRow, fromCol] = selectedPiece;
                if (engine.isValidMove(fromRow, fromCol, row, col)) {
                    executeMove(fromRow, fromCol, row, col);
                }
            }
            return;
        }
        
        // 执行移动
        executeMove(selectedPiece[0], selectedPiece[1], row, col);
    }
    
    /**
     * 处理移动事件
     */
    function handleMove(fromRow, fromCol, toRow, toCol) {
        // 如果AI正在思考或正在回放，不允许操作
        if (isAIThinking || isReplayActive) return false;
        
        // 如果是AI模式且当前是AI的回合，不允许操作
        if (gameMode === 'ai' && engine.currentPlayer === 'b') return false;
        
        // 检查移动是否合法
        if (!engine.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        // 检查是否是兵的升变
        const piece = engine.getPiece(fromRow, fromCol);
        if (engine.getPieceType(piece) === 'P' && (toRow === 0 || toRow === 7)) {
            // 显示升变选择对话框
            showPromotionDialog(fromRow, fromCol, toRow, toCol);
            return true;
        }
        
        // 执行移动
        return executeMove(fromRow, fromCol, toRow, toCol);
    }
    
    /**
     * 执行移动
     */
    function executeMove(fromRow, fromCol, toRow, toCol, promotionPiece) {
        // 执行移动
        const success = engine.makeMove(fromRow, fromCol, toRow, toCol, promotionPiece);
        
        if (success) {
            // 更新UI
            updateUI();
            
            // 重置选择状态
            selectedPiece = null;
            legalMoves = [];
            
            // 高亮显示最后一步移动
            chessboard.highlightLastMove(fromRow, fromCol, toRow, toCol);
            
            // 检查游戏是否结束
            if (engine.gameOver) {
                showGameOverDialog();
                return true;
            }
            
            // 如果是AI模式且轮到AI走棋
            if (gameMode === 'ai' && engine.currentPlayer === 'b') {
                makeAIMove();
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 计算指定位置棋子的所有合法移动
     */
    function calculateLegalMoves(row, col) {
        const moves = [];
        
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (engine.isValidMove(row, col, toRow, toCol)) {
                    moves.push([toRow, toCol]);
                }
            }
        }
        
        return moves;
    }
    
    /**
     * 检查移动是否在合法移动列表中
     */
    function isMoveLegal(row, col) {
        return legalMoves.some(move => move[0] === row && move[1] === col);
    }
    
    /**
     * 设置双人模式
     */
    function setTwoPlayerMode() {
        gameMode = 'two-player';
        updateModeButtons();
        document.getElementById('difficulty-selection').style.display = 'none';
        newGame();
    }
    
    /**
     * 设置AI模式
     */
    function setAIMode() {
        gameMode = 'ai';
        updateModeButtons();
        document.getElementById('difficulty-selection').style.display = 'flex';
        newGame();
    }
    
    /**
     * 更新模式按钮状态
     */
    function updateModeButtons() {
        document.getElementById('two-player-mode').classList.toggle('active', gameMode === 'two-player');
        document.getElementById('ai-mode').classList.toggle('active', gameMode === 'ai');
    }

    // 经典对局列表
    const classicGames = [
        {
            title: '经典义大利开局',
            description: '展示快速发展骑士与象的开局思路。',
            moves: [
                [6,4,4,4], [1,4,3,4], [7,6,5,5], [0,1,2,2], [7,5,4,2], [0,6,2,5],
                [6,3,4,3], [1,3,3,3], [7,4,7,6], [0,2,2,4]
            ],
            notation: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd4', 'd5', 'O-O', 'Be7']
        },
        {
            title: '西西里防御变例',
            description: '一个具有典型战斗风格的现代防御实例。',
            moves: [
                [6,4,4,4], [1,6,3,6], [7,6,5,5], [0,1,2,2], [6,3,4,3], [1,4,2,4],
                [7,5,4,2], [0,6,2,5], [7,4,7,6], [0,3,3,3]
            ],
            notation: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6']
        },
        {
            title: '伦敦体系示范',
            description: '稳健的战略布局，适合控制中心与后翼攻防。',
            moves: [
                [6,3,5,3], [1,4,3,4], [7,6,5,5], [0,6,2,5], [7,2,5,4], [0,1,2,2],
                [7,5,3,3], [1,3,3,3], [7,4,7,6], [0,2,2,4]
            ],
            notation: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4', 'Bf5', 'e3', 'e6', 'Bd3', 'Bd6']
        },
        {
            title: '残局练习：车兵残局',
            description: '演示简单的车兵残局推进与对抗。',
            moves: [
                [6,4,4,4], [1,4,3,4], [7,6,5,5], [0,1,2,2], [6,3,4,3], [1,3,3,3],
                [7,7,5,7], [0,7,2,7], [6,5,4,5], [1,5,3,5]
            ],
            notation: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'd5', 'Rh4', 'Rh5', 'f4', 'f5']
        }
    ];

    let isReplayActive = false;
    let replayState = {
        currentGameIndex: null,
        currentStep: 0,
        intervalId: null
    };

    const strategyArticles = [
        {
            title: '控制中心',
            summary: '掌控中心能让棋子更灵活，限制对方活动范围。',
            content: '稳定的中心控制可以为中局铺平道路。通过兵和轻子占据或施压d4、e4、d5、e5四个格子，你可以获得更广泛的活动空间，同时让对手的布局受到限制。'
        },
        {
            title: '快速发展',
            summary: '前期不要多次移动同一子力，优先完成王车易位。',
            content: '开局阶段的目标是快速把骑士和象发展出来，减少边兵无为移动。优先完成王车易位，构建坚固的防守基础，为后续中局攻防争取时间。'
        },
        {
            title: '王安全',
            summary: '保持王附近兵形完整，避免过早开启中心战线。',
            content: '王车易位后，保持h、g、f线的防护结构非常重要。不要轻易打开王翼或中心兵线，除非你已做好充分准备。'
        },
        {
            title: '兵结构',
            summary: '理解联兵、孤兵、双兵的优缺点，是提高战略理解的关键。',
            content: '稳固的兵形会决定后续战斗的成败。联兵可形成支撑，孤兵和双兵则容易成为敌方进攻目标，因此在交换时要考虑兵结构的长期影响。'
        },
        {
            title: '钉住与牵制',
            summary: '通过牵制对方重要棋子，限制对手的解围手段。',
            content: '钉住和牵制能迫使对方被动防守。典型手段是在中心建立压力，利用象、后、车对敌方骑士或王翼形成钉住。'
        },
        {
            title: '残局思想',
            summary: '进入残局时，棋王活动性与兵推进最为关键。',
            content: '残局阶段要争取棋王参与，同时注意兵的通路。多数残局中，王的活动范围决定胜负，保持通路和避免被锁死是取胜的关键。'
        },
        {
            title: '兵力协调',
            summary: '将轻重子协同配合比单兵强行更稳健。',
            content: '避免孤立棋子，尽量让骑士、象和车形成联动。协调的兵力可以共同攻击弱点，也能更好地应对对手反击。'
        },
        {
            title: '战术范式',
            summary: '钉住、双击、牵制、发现攻击都是常见取胜方式。',
            content: '学习并识别战术图式至关重要。常见主题包括钉住、双击、发现攻击、间接攻击和牵制，它们是快速获得优势的关键手段。'
        },
        {
            title: '空间优势',
            summary: '占据空间能让子力更容易进入敌方阵地。',
            content: '空间优势意味着你有更多可移动区域，同时对手行动空间受限。通过稳步推进中心兵和侧翼兵线，你可以逐渐扩展活动范围。'
        },
        {
            title: '交换原则',
            summary: '当你更灵活时，尽量交换棋子；若被动则避免交换。',
            content: '交换时要评估剩余兵形与活动性。通常在拥有更好结构、更强王翼活动时，主动换掉关键棋子会扩大优势。'
        }
    ];

    let currentStrategyPage = 1;
    const articlesPerPage = 3;

    initLearningPanel();

    function initLearningPanel() {
        document.querySelectorAll('.learning-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.learning-tab').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.learning-content .panel').forEach(panel => panel.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(tab.dataset.panel).classList.add('active');
            });
        });

        document.getElementById('replay-prev').addEventListener('click', () => stepReplay(-1));
        document.getElementById('replay-next').addEventListener('click', () => stepReplay(1));
        document.getElementById('replay-play').addEventListener('click', startReplay);
        document.getElementById('replay-pause').addEventListener('click', pauseReplay);
        document.getElementById('replay-reset').addEventListener('click', resetReplay);

        document.getElementById('strategy-prev').addEventListener('click', () => changeStrategyPage(-1));
        document.getElementById('strategy-next').addEventListener('click', () => changeStrategyPage(1));

        renderClassicGameList();
        renderStrategyPage();
    }

    function renderClassicGameList() {
        const list = document.getElementById('classic-list');
        list.innerHTML = '';

        classicGames.forEach((game, index) => {
            const item = document.createElement('div');
            item.className = 'replay-item';
            item.innerHTML = `
                <div>
                    <h4>${game.title}</h4>
                    <p>${game.description}</p>
                    <p class="strategy-summary">开局示范 ${game.notation.length} 步</p>
                </div>
                <button type="button" data-index="${index}">选择对局</button>
            `;

            item.querySelector('button').addEventListener('click', () => selectClassicGame(index));
            list.appendChild(item);
        });
    }

    function renderStrategyPage() {
        const list = document.getElementById('strategy-list');
        const info = document.getElementById('strategy-page-info');
        const start = (currentStrategyPage - 1) * articlesPerPage;
        const end = start + articlesPerPage;
        const pageArticles = strategyArticles.slice(start, end);

        list.innerHTML = '';

        pageArticles.forEach(article => {
            const item = document.createElement('article');
            item.className = 'strategy-item';
            item.innerHTML = `
                <h3>${article.title}</h3>
                <p class="strategy-summary">${article.summary}</p>
                <p>${article.content}</p>
            `;
            list.appendChild(item);
        });

        const totalPages = Math.ceil(strategyArticles.length / articlesPerPage);
        info.textContent = `第 ${currentStrategyPage} / ${totalPages} 页`;
    }

    function changeStrategyPage(delta) {
        const totalPages = Math.ceil(strategyArticles.length / articlesPerPage);
        currentStrategyPage = Math.min(Math.max(1, currentStrategyPage + delta), totalPages);
        renderStrategyPage();
    }

    function selectClassicGame(index) {
        exitReplayMode();

        replayState.currentGameIndex = index;
        replayState.currentStep = 0;
        isReplayActive = true;

        engine.reset();
        updateUI();
        updateReplayStatus();

        document.getElementById('replay-selected-title').textContent = classicGames[index].title;
        document.getElementById('status').textContent = `回放模式：${classicGames[index].title}`;

        // 自动开始回放
        startReplay();
    }

    function updateReplayStatus() {
        const status = document.getElementById('replay-status');
        if (replayState.currentGameIndex === null) {
            status.textContent = '请选择一局对局开始回放。';
            return;
        }

        const game = classicGames[replayState.currentGameIndex];
        status.textContent = `当前：${game.title} / 步数 ${replayState.currentStep} / ${game.moves.length}`;
    }

    function applyReplayStep(step) {
        const game = classicGames[replayState.currentGameIndex];
        if (!game) return;

        engine.reset();
        for (let i = 0; i < step; i++) {
            const [fromRow, fromCol, toRow, toCol] = game.moves[i];
            engine.makeMove(fromRow, fromCol, toRow, toCol);
        }

        updateUI();
        chessboard.clearSelection();
        chessboard.clearLastMoveHighlight();

        if (step > 0) {
            const [fromRow, fromCol, toRow, toCol] = game.moves[step - 1];
            chessboard.highlightLastMove(fromRow, fromCol, toRow, toCol);
        }
    }

    function stepReplay(direction) {
        if (!isReplayActive || replayState.currentGameIndex === null) return;

        const game = classicGames[replayState.currentGameIndex];
        const nextStep = replayState.currentStep + direction;
        if (nextStep < 0 || nextStep > game.moves.length) return;

        replayState.currentStep = nextStep;
        applyReplayStep(replayState.currentStep);
        updateReplayStatus();
    }

    function startReplay() {
        if (!isReplayActive || replayState.currentGameIndex === null) return;
        if (replayState.intervalId) return;

        replayState.intervalId = setInterval(() => {
            const game = classicGames[replayState.currentGameIndex];
            if (replayState.currentStep >= game.moves.length) {
                pauseReplay();
                return;
            }
            stepReplay(1);
        }, 800);
    }

    function pauseReplay() {
        if (replayState.intervalId) {
            clearInterval(replayState.intervalId);
            replayState.intervalId = null;
        }
    }

    function resetReplay() {
        if (!isReplayActive || replayState.currentGameIndex === null) return;
        pauseReplay();
        replayState.currentStep = 0;
        applyReplayStep(0);
        updateReplayStatus();
    }

    function exitReplayMode() {
        pauseReplay();
        isReplayActive = false;
        replayState.currentGameIndex = null;
        replayState.currentStep = 0;
        document.getElementById('replay-status').textContent = '请选择一局对局开始回放。';
        document.getElementById('replay-selected-title').textContent = '未选择对局';
        updateModeButtons();
    }

    /**
     * 开始新游戏
     */
    function newGame() {
        exitReplayMode();
        // 重置引擎
        engine.reset();
        
        // 重置UI
        selectedPiece = null;
        legalMoves = [];
        chessboard.clearSelection();
        chessboard.clearLastMoveHighlight();
        
        // 更新UI
        updateUI();
        
        // 隐藏游戏结束对话框
        const gameOverModal = document.getElementById('game-over-modal');
        gameOverModal.style.display = 'none';
    }
    
    /**
     * 悔棋
     */
    function undoMove() {
        if (engine.moveHistory.length === 0) return;
        
        // 如果是AI模式，需要撤销两步（玩家的和AI的）
        if (gameMode === 'ai') {
            engine.undoLastMove(); // 撤销AI的移动
            if (engine.moveHistory.length === 0) return;
        }
        
        engine.undoLastMove(); // 撤销玩家的移动
        
        // 更新UI
        updateUI();
        
        // 重置选择状态
        selectedPiece = null;
        legalMoves = [];
        chessboard.clearSelection();
        
        // 如果有最后一步移动，高亮显示
        if (engine.moveHistory.length > 0) {
            const lastMove = engine.getLastMove();
            chessboard.highlightLastMove(lastMove.from[0], lastMove.from[1], lastMove.to[0], lastMove.to[1]);
        } else {
            chessboard.clearLastMoveHighlight();
        }
    }
    
    /**
     * 让AI走棋
     */
    async function makeAIMove() {
        // 设置AI思考标志
        isAIThinking = true;
        
        // 更新状态文本
        document.getElementById('status').textContent = '黑方(AI)正在思考...';
        
        // 使用setTimeout让UI先刷新状态
        setTimeout(async () => {
            const bestMove = await ai.getBestMove(engine);
            
            if (bestMove) {
                const [fromRow, fromCol, toRow, toCol] = bestMove;
                
                // 执行移动
                engine.makeMove(fromRow, fromCol, toRow, toCol);
                
                // 更新UI
                updateUI();
                
                // 高亮显示最后一步移动
                chessboard.highlightLastMove(fromRow, fromCol, toRow, toCol);
                
                // 检查游戏是否结束
                if (engine.gameOver) {
                    showGameOverDialog();
                }
            } else {
                console.warn('AI未返回有效移动');
            }

            // 重置AI思考标志
            isAIThinking = false;
        }, 100);
    }
    
    /**
     * 更新游戏UI
     */
    function updateUI() {
        // 更新棋盘
        chessboard.updateBoard(engine.board);
        
        // 更新状态文本
        document.getElementById('status').textContent = engine.getGameStatusText();
        
        // 更新被吃掉的棋子
        updateCapturedPieces();
        
        // 更新移动历史
        updateMoveHistory();
    }
    
    /**
     * 更新被吃掉的棋子显示
     */
    function updateCapturedPieces() {
        const whiteCaptured = document.querySelector('.white-captured');
        const blackCaptured = document.querySelector('.black-captured');
        
        whiteCaptured.textContent = '白方吃子：' + formatCapturedPieces(engine.capturedPieces.w);
        blackCaptured.textContent = '黑方吃子：' + formatCapturedPieces(engine.capturedPieces.b);
    }
    
    /**
     * 格式化被吃掉的棋子
     */
    function formatCapturedPieces(capturedPieces) {
        if (capturedPieces.length === 0) return '无';
        
        // 使用符号表示棋子
        const pieceSymbols = {
            'wP': '♙', 'wR': '♖', 'wN': '♘', 'wB': '♗', 'wQ': '♕', 'wK': '♔',
            'bP': '♟', 'bR': '♜', 'bN': '♞', 'bB': '♝', 'bQ': '♛', 'bK': '♚'
        };
        
        return capturedPieces.map(piece => pieceSymbols[piece] || piece).join(' ');
    }
    
    /**
     * 更新移动历史
     */
    function updateMoveHistory() {
        const movesElement = document.getElementById('moves');
        movesElement.innerHTML = '';
        
        const moves = engine.moveHistory;
        
        for (let i = 0; i < moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const moveWhite = moves[i].notation;
            const moveBlack = i + 1 < moves.length ? moves[i + 1].notation : '';
            
            const moveNumberSpan = document.createElement('span');
            moveNumberSpan.textContent = moveNumber + '.';
            moveNumberSpan.className = 'move-number';
            
            const moveWhiteSpan = document.createElement('span');
            moveWhiteSpan.textContent = moveWhite;
            moveWhiteSpan.className = 'move-white';
            
            movesElement.appendChild(moveNumberSpan);
            movesElement.appendChild(moveWhiteSpan);
            
            if (moveBlack) {
                const moveBlackSpan = document.createElement('span');
                moveBlackSpan.textContent = moveBlack;
                moveBlackSpan.className = 'move-black';
                
                movesElement.appendChild(moveBlackSpan);
            }
        }
        
        // 滚动到底部
        movesElement.scrollTop = movesElement.scrollHeight;
    }
    
    /**
     * 设置升变模态框
     */
    function setupPromotionModal() {
        const promotionModal = document.getElementById('promotion-modal');
        const promotionPieces = promotionModal.querySelectorAll('.piece');
        
        promotionPieces.forEach(pieceElement => {
            pieceElement.addEventListener('click', function() {
                const piece = this.getAttribute('data-piece');
                promotionModal.style.display = 'none';
                
                // 完成升变移动
                if (promotionData) {
                    executeMove(
                        promotionData.fromRow, 
                        promotionData.fromCol, 
                        promotionData.toRow, 
                        promotionData.toCol, 
                        piece.toUpperCase()
                    );
                }
                
                promotionData = null;
            });
        });
    }
    
    // 存储升变数据
    let promotionData = null;
    
    /**
     * 显示升变选择对话框
     */
    function showPromotionDialog(fromRow, fromCol, toRow, toCol) {
        promotionData = { fromRow, fromCol, toRow, toCol };
        
        // 显示对话框
        const promotionModal = document.getElementById('promotion-modal');
        promotionModal.style.display = 'flex';
        
        // 根据当前玩家设置升变棋子的颜色
        const color = engine.currentPlayer;
        const pieces = promotionModal.querySelectorAll('.piece');
        
        pieces.forEach(piece => {
            piece.className = 'piece ' + piece.getAttribute('data-piece');
            
            // 根据当前玩家更改背景图片
            if (color === 'b') {
                piece.style.backgroundImage = piece.style.backgroundImage.replace('w', 'b');
            } else {
                piece.style.backgroundImage = piece.style.backgroundImage.replace('b', 'w');
            }
        });
    }
    
    /**
     * 显示游戏结束对话框
     */
    function showGameOverDialog() {
        const gameOverModal = document.getElementById('game-over-modal');
        const gameResult = document.getElementById('game-result');
        
        gameResult.textContent = engine.getGameStatusText();
        gameOverModal.style.display = 'flex';
    }
});

/**
 * 加载国际象棋SVG棋子图像
 */
function loadChessPieceImages() {
    const pieces = ['wP', 'wR', 'wN', 'wB', 'wQ', 'wK', 'bP', 'bR', 'bN', 'bB', 'bQ', 'bK'];
    
    // 创建images目录（如果不存在）
    const imagesDir = 'images';
    
    // 为每个棋子创建SVG文件
    pieces.forEach(piece => {
        const color = piece.charAt(0) === 'w' ? 'white' : 'black';
        let type;
        
        switch (piece.charAt(1)) {
            case 'P': type = 'pawn'; break;
            case 'R': type = 'rook'; break;
            case 'N': type = 'knight'; break;
            case 'B': type = 'bishop'; break;
            case 'Q': type = 'queen'; break;
            case 'K': type = 'king'; break;
        }
        
        createChessPieceSVG(piece, color, type);
    });
}

/**
 * 创建国际象棋棋子的SVG文件
 */
function createChessPieceSVG(piece, color, type) {
    // 获取SVG内容
    const svgContent = getChessPieceSVG(color, type);
    
    // 创建Blob对象
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // 创建一个图像元素预加载SVG
    const img = new Image();
    img.src = url;
    img.style.display = 'none';
    document.body.appendChild(img);
    
    // 创建a标签下载SVG文件
    const a = document.createElement('a');
    a.href = url;
    a.download = `${piece}.svg`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        document.body.removeChild(img);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * 获取棋子的SVG内容
 */
function getChessPieceSVG(color, type) {
    const fillColor = color === 'white' ? '#ffffff' : '#000000';
    const strokeColor = color === 'white' ? '#000000' : '#ffffff';
    
    let path = '';
    
    switch (type) {
        case 'pawn':
            path = 'M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z';
            break;
        case 'rook':
            path = 'M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z M 12.5,32 L 14,29.5 L 31,29.5 L 32.5,32 L 12.5,32 z M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z M 34,14 L 34,29.5 L 31,29.5 L 31,17 L 14,17 L 14,29.5 L 11,29.5 L 11,14 L 34,14 z';
            break;
        case 'knight':
            path = 'M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18 M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10';
            break;
        case 'bishop':
            path = 'M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z M 25,8 A 2.5,2.5 0 1,1 20,8 A 2.5,2.5 0 1,1 25,8 z';
            break;
        case 'queen':
            path = 'M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z M 11.5,30 C 15,29 30,29 33.5,30 M 12,33.5 C 18,32.5 27,32.5 33,33.5';
            break;
        case 'king':
            path = 'M 22.5,11.63 L 22.5,6 M 20,8 L 25,8 M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,29.5 11.5,29.5 L 11.5,37 z';
            break;
    }
    
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="45" height="45">
  <g style="fill:none; fill-opacity:1; fill-rule:evenodd; stroke:${strokeColor}; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;">
    <path d="${path}" style="fill:${fillColor}; stroke:${strokeColor};" />
  </g>
</svg>`;
}

// 执行加载棋子图像的函数
// loadChessPieceImages();