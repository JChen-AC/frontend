import { useState, useEffect } from "react";
import {
  createSolvedBoard,
  shuffleBoard,
  moveTile,
  isSolved,
  calculateProgress,
} from "./gameLogic";

export function useGameLogic() {
  const [board, setBoard] = useState(createSolvedBoard());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const startGame = (initialBoard) => {
    const boardToUse =
      initialBoard && Array.isArray(initialBoard)
        ? initialBoard
        : shuffleBoard(createSolvedBoard(), 120);

    setBoard(boardToUse);
    setMoves(0);
    setTime(0);
    setProgress(calculateProgress(boardToUse));
    setIsFinished(false);
    setHasStarted(true);
  };

  const resetGame = () => {
    setBoard(createSolvedBoard());
    setMoves(0);
    setTime(0);
    setProgress(0);
    setIsFinished(false);
    setHasStarted(false);
  };

  useEffect(() => {
    if (!hasStarted || isFinished) return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isFinished]);

  const handleMove = (index) => {
    if (!hasStarted || isFinished) return;

    const newBoard = moveTile(board, index);

    if (newBoard !== board) {
      setBoard(newBoard);
      setMoves((m) => m + 1);

      const p = calculateProgress(newBoard);
      setProgress(p);

      if (isSolved(newBoard)) {
        setIsFinished(true);
      }
    }
  };

  return {
    board,
    moves,
    time,
    progress,
    isFinished,
    hasStarted,
    startGame,
    resetGame,
    handleMove,
  };
}