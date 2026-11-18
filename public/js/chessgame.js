
const socket = io({
    transports: ['websocket']
});

const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedpiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = '';

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement('div');

            squareElement.classList.add(
                'square',
                (rowIndex + squareIndex) % 2 === 0 ? 'white' : 'black'
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement('div');

                pieceElement.classList.add(
                    'piece',
                    square.color === 'w' ? 'white' : 'black'
                );

                pieceElement.innerText = getPieceUnicode(square);

                pieceElement.draggable =
                    playerRole && playerRole === square.color;

                pieceElement.addEventListener('dragstart', (e) => {
                    if (pieceElement.draggable) {
                        draggedpiece = pieceElement;

                        sourceSquare = {
                            row: rowIndex,
                            col: squareIndex
                        };

                        e.dataTransfer.setData('text/plain', '');
                    }
                });

                pieceElement.addEventListener('dragend', () => {
                    draggedpiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener('drop', (e) => {
                e.preventDefault();

                if (draggedpiece && sourceSquare) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare, targetSource);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    if (playerRole === 'b') {
        boardElement.classList.add('flipped');
    } else {
        boardElement.classList.remove('flipped');
    }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    socket.emit('move', move);
};

const getPieceUnicode = (piece) => {
    const pieceUnicode = {
        p: '♙',
        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚',
        P: '♙',
        R: '♖',
        N: '♘',
        B: '♗',
        Q: '♕',
        K: '♔'
    };

    return pieceUnicode[piece.type] || '';
};

// Player assignment
socket.on('playerRole', (role) => {
    playerRole = role;
    renderBoard();
});

// Spectator assignment
socket.on('SpectatorRole', () => {
    playerRole = null;
    renderBoard();
});

// Receive the latest board position
socket.on('boardState', (fen) => {
    chess.load(fen);
    renderBoard();
});

// Invalid move notification
socket.on('invalidMove', () => {
    console.log('Invalid move!');
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
});

renderBoard();
