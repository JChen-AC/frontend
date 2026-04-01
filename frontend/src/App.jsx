import { useState, useEffect } from "react";
import "./styles.css";
import { useGameLogic } from "./logic/useGameLogic";
import { getMovableTiles, moveTile, calculateProgress } from "./logic/gameLogic";
import { createRoom, joinRoom, markReady, getRoom } from "./services/lobbyApi";

export default function App() {
  const [screen, setScreen] = useState("lobby");
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [winner, setWinner] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sharedBoard, setSharedBoard] = useState([]);
  const [opponentName, setOpponentName] = useState("");
  const [opponentBoard, setOpponentBoard] = useState([]);
  const [opponentProgress, setOpponentProgress] = useState(0);

  const {
    board,
    moves,
    time,
    progress,
    isFinished,
    startGame,
    resetGame,
    handleMove,
  } = useGameLogic(Array.isArray(sharedBoard) && sharedBoard.length ? sharedBoard : null);

    //polling
    useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(async () => {
      try {
        const room = await getRoom(roomId);

        if (room.player1 === playerName) {
          setOpponentName(room.player2 || "");
        } else {
          setOpponentName(room.player1 || "");
        }

        // 只初始化一次 shared board
        if (Array.isArray(room.board) && (!Array.isArray(sharedBoard) || sharedBoard.length === 0)) {
          setSharedBoard(room.board);
        }

        // 只要游戏开始了，就进入 game
        if (room.gameStarted && Array.isArray(room.board) && screen !== "game") {
          setSharedBoard(room.board);
          setOpponentBoard(room.board); // temporary placeholder until SpaceTimeDB
          setOpponentProgress(calculateProgress(room.board));
          startGame(room.board);
          setScreen("game");
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, playerName, sharedBoard, screen, startGame]);
  
  useEffect(() => {
  if (screen !== "game" || !Array.isArray(opponentBoard) || opponentBoard.length === 0) {
    return;
  }

  const interval = setInterval(() => {
    setOpponentBoard((currentBoard) => {
      if (!Array.isArray(currentBoard) || currentBoard.length === 0) return currentBoard;

      const possibleMoves = getMovableTiles(currentBoard);
      if (!possibleMoves.length) return currentBoard;

      const randomMove =
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

      const updatedBoard = moveTile(currentBoard, randomMove);
      setOpponentProgress(calculateProgress(updatedBoard));
      return updatedBoard;
    });
  }, 2000);

  return () => clearInterval(interval);
  }, [screen, opponentBoard]);

  
  // Demo shared board
  const demoInitialBoard = [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 0, 14, 15,
  ];


  const handleCreateRoom = async () => {
    try {

      setError(""); // 👈 清掉旧错误

      const room = await createRoom(playerName);

      console.log("Created room:", room);

      setRoomId(room.roomId);
      setScreen("lobby");
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setError("");      // 清错误
      setMessage("");    // 清旧提示
      const room = await joinRoom(roomId, playerName);
      console.log("Joined room:", room);
      setRoomId(room.roomId);
      setScreen("lobby");
      if (room.player1 === playerName) {
        setOpponentName(room.player2 || "");
      } else {
        setOpponentName(room.player1 || "");
      }
      setMessage("Joined room successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReady = async () => {
    try {
      setError(""); // 清空旧错误
      const room = await markReady(roomId, playerName);
      if (room.board) {
        console.log("Received board:", room.board);
        setSharedBoard(room.board);
      }
      if (room.player1 === playerName) {
        setOpponentName(room.player2 || "");
      } else {
        setOpponentName(room.player1 || "");
      }
      setIsReady(true);

      if (room.gameStarted && room.board) {
      setSharedBoard(room.board);
      setOpponentBoard(room.board); // temporary placeholder until SpaceTimeDB
      setOpponentProgress(calculateProgress(room.board));
      startGame(room.board);
      setScreen("game");
      }

    } catch (err) {
       setError(err.message); // 👈 显示后端错误
    }
  };

  const handleTileClick = (index) => {
    handleMove(index);
  };

  const handleBackToLobby = () => {
    resetGame();
    setIsReady(false);
    setWinner("");
    setOpponentBoard([]);
    setOpponentProgress(0);
    setScreen("lobby");
};

  useEffect(() => {
    if (isFinished && screen === "game" && !winner) {
      setWinner(playerName);
      setScreen("result");
    }
  }, [isFinished, screen, winner, playerName]);

  return (
    <div className="app">
      <header className="header">
        <h1>1v1 15 Puzzle</h1>
      </header>

      {screen === "lobby" && (
        <LobbyScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomId={roomId}
          setRoomId={setRoomId}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onReady={handleReady}
          isReady={isReady}
          error={error}
          message={message}
        />
      )}

      {screen === "game" && (
      <GameScreen
        roomId={roomId}
        playerName={playerName}
        opponentName={opponentName}
        board={board}
        opponentBoard={opponentBoard}
        moves={moves}
        time={time}
        myProgress={progress}
        opponentProgress={opponentProgress}
        onTileClick={handleTileClick}
      />
    )}

      {screen === "result" && (
        <ResultScreen
          winner={winner}
          playerName={playerName}
          moves={moves}
          time={time}
          onPlayAgain={handleBackToLobby}
        />
      )}
    </div>
  );
}

function LobbyScreen({
  playerName,
  setPlayerName,
  roomId,
  setRoomId,
  onCreateRoom,
  onJoinRoom,
  onReady,
  isReady,
  error,
  message,
}) {
  return (
    
    <div className="card">
      <label className="label">Player Name</label>
      <input
        className="input"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
      />
      <label className="label">Room ID</label>
      <input
        className="input"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter room ID"
      />
      <div className="room-box">
        <p><strong>Room ID:</strong> {roomId}</p>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="button-row">
        <button className="btn" onClick={onCreateRoom}>Create Room</button>
        <button className="btn secondary" onClick={onJoinRoom}>Join Room</button>

      </div>
      <button className="btn ready" onClick={onReady} disabled={isReady}>
        {isReady ? "Waiting for Player 2..." : "Ready"}
      </button>
    </div>
  );
}

function GameScreen({
  roomId,
  playerName,
  opponentName,
  board,
  opponentBoard,
  moves,
  time,
  myProgress,
  opponentProgress,
  onTileClick,
}) {
  return (
    <div className="game-screen">
      <div className="game-info">
        <h2>Game Info</h2>
        <p>Room: {roomId}</p>
        <p>You: {playerName}</p>
        <p>Opponent: {opponentName}</p>
        <p>Moves: {moves}</p>
        <p>Time: {time}s</p>
      </div>

      <ProgressBar label="Your Progress" value={myProgress} />
      <ProgressBar label="Opponent Progress" value={opponentProgress} />

      <div className="boards-layout">
        <div>
          <h2>Your Board</h2>
          <PuzzleBoard board={board} onTileClick={onTileClick} />
        </div>

        <div>
          <h2>{opponentName || "Opponent"}'s Board</h2>
          <PuzzleBoard board={opponentBoard} small readOnly />
        </div>
      </div>
    </div>
  );
}

function PuzzleBoard({ board, onTileClick, small = false, readOnly = false }) {
  return (
    <div className={`board ${small ? "board-small" : ""}`}>
      {board.map((tile, index) => (
        <button
          key={index}
          className={`tile ${small ? "tile-small" : ""} ${tile === 0 ? "empty" : ""}`}
          onClick={() => {
            if (!readOnly && tile !== 0 && onTileClick) {
              onTileClick(index);
            }
          }}
          disabled={readOnly || tile === 0}
        >
          {tile !== 0 ? tile : ""}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ label, value }) {
  return (
    <div className="progress-wrap">
      <div className="progress-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ResultScreen({ winner, playerName, moves, time, onPlayAgain }) {
  const isWinner = winner === playerName;

  return (
    <div className="card result-card">
      <h2>{isWinner ? "You Win!" : "Game Over"}</h2>
      <p><strong>Winner:</strong> {winner}</p>
      <p><strong>Your Moves:</strong> {moves}</p>
      <p><strong>Your Time:</strong> {time}s</p>

      <button className="btn" onClick={onPlayAgain}>
        Back to Lobby
      </button>
    </div>
  );
}

