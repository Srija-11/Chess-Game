const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');
let draggedpiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board=chess.board();
    boardElement.innerHTML = '';
    board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
        const squareElement = document.createElement('div');
        squareElement.classList.add(
            "square",
            (rowIndex + squareIndex) % 2 === 0 ? 'white' : 'black', 
        );
        squareElement.dataset.row=rowIndex;
        squareElement.dataset.col=squareIndex;
        if (square) {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece', square.color=== 'w' ? 'white' : 'black');
            pieceElement.innerText = getPieceUnicode(square);
            pieceElement.draggable = playerRole && playerRole.toLowerCase() === square.color;
            pieceElement.addEventListener('dragstart', (e) => {
    if (pieceElement.draggable) {
        draggedpiece = pieceElement;
        sourceSquare = { row: rowIndex, col: squareIndex };
        e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    }
});
            pieceElement.addEventListener('dragend', () => {
                draggedpiece = null;
                sourceSquare = null;
            });
            squareElement.appendChild(pieceElement);
        };
        squareElement.addEventListener('dragover', (e) => {
            e.preventDefault();
        }); 
        squareElement.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedpiece){
                const targetSource = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col)
                };
                handleMove(sourceSquare, targetSource);
            };
        });
        boardElement.appendChild(squareElement);
      });
    });
    if (playerRole === "b") {
    boardElement.classList.add('flipped');
} else {
    boardElement.classList.remove('flipped');
}

};
 const handleMove=(source,target)=>{
    const move={
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q' // Always promote to queen for simplicity}
 };
 socket.emit("move", move);
};
 const getPieceUnicode=(piece)=>{
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
    return pieceUnicode[piece.type]|| "";
};
socket.on('playerRole', (role) => {
    playerRole = role;
    renderBoard();
});
socket.on('spectatorRole', () => {
    playerRole=null;
    renderBoard();
});
socket.on('boardState', (fen) => {
    chess.load(fen);
    renderBoard();
});
socket.on('move', (move) => {
    chess.move(move);
    renderBoard();
});
 renderBoard();