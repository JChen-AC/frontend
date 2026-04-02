import { useState, useEffect } from "react";
import {
  createSolvedBoard,
  shuffleBoard,
  moveTile,
  isSolved,
  calculateProgress,
} from "./gameLogic";
import { DbConnection, reducers } from "../module_bindings";
import {useSpacetimeDB,useTable,useReducer} from 'spacetimedb/react'

export function useGameLogic(initialBoard = null) {
  const mark_endtime = useReducer(reducers.markPuzzleCompleted);
  const update_db_board = useReducer(reducers.updateGameBoard);
  const [board, setBoard] = useState(
    Array.isArray(initialBoard) && initialBoard.length
      ? initialBoard
      : shuffleBoard(createSolvedBoard(), 120)
  );
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialBoard) && initialBoard.length) {
      setBoard(initialBoard);
      setProgress(calculateProgress(initialBoard));
    }
  }, [initialBoard]);

  const startGame = (boardFromServer) => {
    const boardToUse =
      Array.isArray(boardFromServer) && boardFromServer.length
        ? boardFromServer
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

  // WHERE TIME INCREMENTS 
  useEffect(() => {
    if (!hasStarted || isFinished) return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isFinished]);

  const handleMove = (index,roomCode) => {
    if (!hasStarted || isFinished) return;

    const newBoard = moveTile(board, index);

    if (newBoard !== board) {
      setBoard(newBoard);
      setMoves((m) => m + 1);
      update_db_board({roomCode:roomCode,boardState:board})

      const p = calculateProgress(newBoard);
      setProgress(p);

      // Checks for solve 
      if (isSolved(newBoard)) {
        setIsFinished(true);
        // add reducers 
        mark_endtime();
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