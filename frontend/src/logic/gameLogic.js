export function createSolvedBoard() {
  return [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 0,
  ];
}

export function shuffleBoard(board, moves = 100) {
  let newBoard = [...board];

  for (let i = 0; i < moves; i++) {
    const possibleMoves = getMovableTiles(newBoard);
    const randomTile =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    newBoard = moveTile(newBoard, randomTile);
  }

  return newBoard;
}

export function getMovableTiles(board) {
  const emptyIndex = board.indexOf(0);
  const moves = [];

  const row = Math.floor(emptyIndex / 4);
  const col = emptyIndex % 4;

  if (row > 0) moves.push(emptyIndex - 4);
  if (row < 3) moves.push(emptyIndex + 4);
  if (col > 0) moves.push(emptyIndex - 1);
  if (col < 3) moves.push(emptyIndex + 1);

  return moves;
}

export function moveTile(board, index) {
  const emptyIndex = board.indexOf(0);
  const validMoves = getMovableTiles(board);

  if (!validMoves.includes(index)) return board;

  const newBoard = [...board];
  [newBoard[index], newBoard[emptyIndex]] = [
    newBoard[emptyIndex],
    newBoard[index],
  ];

  return newBoard;
}

export function isSolved(board) {
  for (let i = 0; i < 15; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[15] === 0;
}

export function calculateProgress(board) {
  let correct = 0;

  for (let i = 0; i < 15; i++) {
    if (board[i] === i + 1) correct++;
  }

  return Math.floor((correct / 15) * 100);
}