/**
 * 国际象棋AI引擎
 * 使用Stockfish引擎替代极小化极大算法
 */
class ChessAI {
    constructor(difficulty = 'medium') {
        this.setDifficulty(difficulty);
        this.stockfish = null;
        this.isReady = false;
        this.initStockfish();
    }

    // 设置AI难度
    setDifficulty(difficulty) {
        switch (difficulty) {
            case 'easy':
                this.skillLevel = 0; // Stockfish skill level 0-20
                break;
            case 'medium':
                this.skillLevel = 10;
                break;
            case 'hard':
                this.skillLevel = 20;
                break;
            default:
                this.skillLevel = 10;
        }
    }

    // 初始化Stockfish引擎
    async initStockfish() {
        try {
            if (!window.Worker) {
                throw new Error('浏览器不支持Web Worker');
            }

            this.stockfish = new Worker('js/stockfish.js');
            this.isReady = false;
            this.bestMoveResolver = null;
            this.bestMoveTimeout = null;

            this.stockfish.onmessage = (event) => {
                const message = event.data;
                console.log('Stockfish:', message);

                if (message === 'readyok') {
                    this.isReady = true;
                    return;
                }

                if (message.startsWith('bestmove')) {
                    const uciMove = this.parseBestMove(message);
                    if (uciMove && uciMove !== 'none' && this.bestMoveResolver) {
                        const move = this.uciToMove(uciMove);
                        this.bestMoveResolver(move);
                        this.bestMoveResolver = null;
                        if (this.bestMoveTimeout) {
                            clearTimeout(this.bestMoveTimeout);
                            this.bestMoveTimeout = null;
                        }
                    }
                }
            };

            this.sendUCICommand('uci');
            this.sendUCICommand('isready');

            // 等待Stockfish准备完成
            await this.waitForReady();
            this.sendUCICommand(`setoption name Skill Level value ${this.skillLevel}`);

            console.log('Stockfish引擎初始化完成');
        } catch (error) {
            console.error('Stockfish初始化失败:', error);
            this.isReady = false;
        }
    }

    // 等待Stockfish就绪
    waitForReady() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Stockfish就绪超时')); 
            }, 5000);

            const checkReady = () => {
                if (this.isReady) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(checkReady, 50);
                }
            };

            checkReady();
        });
    }

    // 发送UCI命令到Stockfish
    sendUCICommand(command) {
        if (!this.stockfish) {
            console.warn('Stockfish未初始化');
            return;
        }

        console.log('发送命令:', command);
        this.stockfish.postMessage(command);
    }

    // 获取AI建议的最佳移动
    async getBestMove(engine) {
        if (!this.isReady) {
            console.warn('Stockfish未准备好，使用备用算法');
            return this.getBestMoveFallback(engine);
        }

        const startTime = Date.now();

        try {
            const fen = engine.toFEN();
            this.sendUCICommand('ucinewgame');
            this.sendUCICommand(`position fen ${fen}`);
            this.sendUCICommand(`setoption name Skill Level value ${this.skillLevel}`);

            const timeLimit = this.getTimeLimit();
            const bestMovePromise = this.waitForBestMove();
            this.sendUCICommand(`go movetime ${timeLimit}`);

            const bestMove = await bestMovePromise;
            const endTime = Date.now();
            console.log(`Stockfish思考时间: ${endTime - startTime}ms`);

            return bestMove || this.getBestMoveFallback(engine);
        } catch (error) {
            console.error('Stockfish计算失败，使用备用算法:', error);
            return this.getBestMoveFallback(engine);
        }
    }

    // 获取思考时间限制（毫秒）
    getTimeLimit() {
        switch (this.skillLevel) {
            case 0: return 500;
            case 10: return 1000;
            case 20: return 2000;
            default: return 1000;
        }
    }

    // 等待Stockfish返回bestmove
    waitForBestMove() {
        return new Promise((resolve) => {
            this.bestMoveResolver = resolve;
            if (this.bestMoveTimeout) {
                clearTimeout(this.bestMoveTimeout);
            }
            this.bestMoveTimeout = setTimeout(() => {
                if (this.bestMoveResolver) {
                    this.bestMoveResolver(null);
                    this.bestMoveResolver = null;
                }
            }, 5000);
        });
    }

    // 解析Stockfish的bestmove输出
    parseBestMove(output) {
        const match = output.match(/bestmove\s+(\w+)/);
        if (!match) return null;
        const uciMove = match[1];
        return uciMove === 'none' ? null : uciMove;
    }

    // 将UCI移动格式转换为[fromRow, fromCol, toRow, toCol]
    uciToMove(uciMove) {
        if (uciMove.length < 4) return null;

        const fromFile = uciMove.charCodeAt(0) - 97;
        const fromRank = 8 - parseInt(uciMove[1], 10);
        const toFile = uciMove.charCodeAt(2) - 97;
        const toRank = 8 - parseInt(uciMove[3], 10);

        return [fromRank, fromFile, toRank, toFile];
    }

    // 备用算法（原来的minimax）
    getBestMoveFallback(engine) {
        const startTime = Date.now();
        const bestMove = this.minimaxRoot(3, engine, true); // 使用固定深度3
        const endTime = Date.now();

        console.log(`备用算法思考时间: ${endTime - startTime}ms`);
        return bestMove;
    }

    // 极小化极大算法根节点，返回最佳移动
    minimaxRoot(depth, engine, isMaximizingPlayer) {
        const newGameMoves = this.generateAllPossibleMoves(engine);
        let bestMove = null;
        let bestValue = isMaximizingPlayer ? -9999 : 9999;
        const playerColor = engine.currentPlayer;
        
        for (const move of newGameMoves) {
            const [fromRow, fromCol, toRow, toCol] = move;
            
            // 模拟移动
            const originalPiece = engine.getPiece(toRow, toCol);
            const movingPiece = engine.getPiece(fromRow, fromCol);
            
            engine.makeMove(fromRow, fromCol, toRow, toCol);
            
            // 递归评估
            const value = this.minimax(depth - 1, engine, -10000, 10000, !isMaximizingPlayer);
            
            // 撤销移动(makeMove已经交换了玩家，所以再交换回来)
            engine.undoLastMove();
            
            // 增加吃子奖励
            let captureBonus = 0;
            if (originalPiece) {
                const capturedType = engine.getPieceType(originalPiece);
                captureBonus = this.pieceValues[capturedType] * 0.1; // 吃子奖励
            }
            
            if (isMaximizingPlayer) {
                value += captureBonus;
                if (value > bestValue) {
                    bestValue = value;
                    bestMove = move;
                }
            } else {
                value -= captureBonus;
                if (value < bestValue) {
                    bestValue = value;
                    bestMove = move;
                }
            }
        }
        
        return bestMove;
    }

    // 极小化极大算法 + Alpha-Beta剪枝
    minimax(depth, engine, alpha, beta, isMaximizingPlayer) {
        if (depth === 0) {
            return this.evaluateBoard(engine);
        }
        
        const possibleMoves = this.generateAllPossibleMoves(engine);
        
        // 如果没有可能的移动，检查是否将军（将杀或和局）
        if (possibleMoves.length === 0) {
            if (engine.isKingInCheck(engine.currentPlayer)) {
                // 将杀，当前玩家输了
                return isMaximizingPlayer ? -9000 : 9000;
            } else {
                // 和局
                return 0;
            }
        }
        
        if (isMaximizingPlayer) {
            let value = -9999;
            
            for (const move of possibleMoves) {
                const [fromRow, fromCol, toRow, toCol] = move;
                
                engine.makeMove(fromRow, fromCol, toRow, toCol);
                value = Math.max(value, this.minimax(depth - 1, engine, alpha, beta, !isMaximizingPlayer));
                engine.undoLastMove();
                
                alpha = Math.max(alpha, value);
                if (alpha >= beta) {
                    break; // Beta剪枝
                }
            }
            
            return value;
        } else {
            let value = 9999;
            
            for (const move of possibleMoves) {
                const [fromRow, fromCol, toRow, toCol] = move;
                
                engine.makeMove(fromRow, fromCol, toRow, toCol);
                value = Math.min(value, this.minimax(depth - 1, engine, alpha, beta, !isMaximizingPlayer));
                engine.undoLastMove();
                
                beta = Math.min(beta, value);
                if (alpha >= beta) {
                    break; // Alpha剪枝
                }
            }
            
            return value;
        }
    }

    // 生成所有可能的移动
    generateAllPossibleMoves(engine) {
        const moves = [];
        const currentPlayer = engine.currentPlayer;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.getPiece(row, col);
                
                if (piece && engine.getPieceColor(piece) === currentPlayer) {
                    // 对每一个棋子，尝试移动到棋盘上的每一个位置
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (engine.isValidMove(row, col, toRow, toCol)) {
                                moves.push([row, col, toRow, toCol]);
                            }
                        }
                    }
                }
            }
        }
        
        return moves;
    }

    // 评估棋盘状态
    evaluateBoard(engine) {
        // 如果游戏结束，直接返回大的正/负值
        if (engine.gameOver) {
            if (engine.isCheckmate()) {
                // 上一个走棋的玩家获胜
                return engine.currentPlayer === 'w' ? -9000 : 9000;
            } else {
                // 和局
                return 0;
            }
        }
        
        let value = 0;
        
        // 考虑是否是残局（简单判断：棋盘上重子少于等于6个）
        let heavyPieces = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.getPiece(row, col);
                if (piece && ['Q', 'R'].includes(engine.getPieceType(piece))) {
                    heavyPieces++;
                }
            }
        }
        const isEndgame = heavyPieces <= 6;
        
        // 棋子价值 + 位置价值
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.getPiece(row, col);
                if (!piece) continue;
                
                const pieceType = engine.getPieceType(piece);
                const pieceColor = engine.getPieceColor(piece);
                
                // 基础棋子价值
                let pieceValue = this.pieceValues[pieceType];
                if (pieceColor === 'b') {
                    pieceValue = -pieceValue;
                }
                
                // 位置价值
                let positionValue = 0;
                
                switch (pieceType) {
                    case 'P':
                        positionValue = this.pawnEvalWhite[row][col];
                        break;
                    case 'N':
                        positionValue = this.knightEval[row][col];
                        break;
                    case 'B':
                        positionValue = this.bishopEvalWhite[row][col];
                        break;
                    case 'R':
                        positionValue = this.rookEvalWhite[row][col];
                        break;
                    case 'Q':
                        positionValue = this.queenEval[row][col];
                        break;
                    case 'K':
                        positionValue = isEndgame ? 
                                      this.kingEndgameEvalWhite[row][col] : 
                                      this.kingEvalWhite[row][col];
                        break;
                }
                
                // 黑方的评估表要翻转
                if (pieceColor === 'b') {
                    positionValue = -positionValue;
                    // 黑方棋子位置要从底端翻转
                    if (['P', 'B', 'R', 'K'].includes(pieceType)) {
                        positionValue = -this.getReversedPositionValue(pieceType, row, col, isEndgame);
                    }
                }
                
                value += pieceValue + positionValue;
            }
        }
        
        // 机动性奖励
        const mobilityBonus = this.generateAllPossibleMoves(engine).length * 0.1;
        value += engine.currentPlayer === 'w' ? mobilityBonus : -mobilityBonus;
        
        // 被将军惩罚
        if (engine.isKingInCheck(engine.currentPlayer)) {
            value += engine.currentPlayer === 'w' ? -5 : 5;
        }
        
        return value;
    }

    // 为黑方翻转位置评估表
    getReversedPositionValue(pieceType, row, col, isEndgame) {
        // 黑方的位置评估是白方的镜像翻转
        const reversedRow = 7 - row;
        
        switch (pieceType) {
            case 'P':
                return this.pawnEvalWhite[reversedRow][col];
            case 'B':
                return this.bishopEvalWhite[reversedRow][col];
            case 'R':
                return this.rookEvalWhite[reversedRow][col];
            case 'K':
                return isEndgame ? 
                      this.kingEndgameEvalWhite[reversedRow][col] : 
                      this.kingEvalWhite[reversedRow][col];
            default:
                return 0;
        }
    }
}

// 导出类使其可以被其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessAI;
} 