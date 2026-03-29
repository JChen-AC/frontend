import { useState, useEffect } from "react";
import "./styles.css";
import { useGameLogic } from "./logic/useGameLogic";
import { createRoom, joinRoom, markReady, getRoom } from "./services/lobbyApi";

export default function App() {
  const [screen, setScreen] = useState("lobby");
  const [roomId, setRoomId] = useState("ROOM-123");
  const [playerName, setPlayerName] = useState("Player 1");
  const [opponentName] = useState("Player 2");
  const [isReady, setIsReady] = useState(false);
  const [winner, setWinner] = useState("");

  const {
    board,
    moves,
    time,
    progress,
    isFinished,
    startGame,
    resetGame,
    handleMove,
  } = useGameLogic();

  // Demo shared board
  const demoInitialBoard = [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 0, 14, 15,
  ];

  const opponentProgress = Math.min(progress + 10, 100);

  const handleCreateRoom = async () => {
    try {
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
      const room = await joinRoom(roomId, playerName);
      console.log("Joined room:", room);
      setRoomId(room.roomId);
      setScreen("lobby");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReady = async () => {
    try {
      const room = await markReady(roomId, playerName);

      console.log("Ready:", room);

      setIsReady(true);

      setTimeout(() => {
        setScreen("game");
      }, 500);

    } catch (err) {
      console.error(err);
    }
  };

  const handleTileClick = (index) => {
    handleMove(index);
  };

  const handleBackToLobby = () => {
    resetGame();
    setIsReady(false);
    setWinner("");
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
        />
      )}

      {screen === "game" && (
        <GameScreen
          roomId={roomId}
          playerName={playerName}
          opponentName={opponentName}
          board={board}
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
}) {
  return (
    <div className="card">
      <h2>Lobby</h2>

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
  moves,
  time,
  myProgress,
  opponentProgress,
  onTileClick,
}) {
  return (
    <div className="game-layout">
      <div className="left-panel card">
        <h2>Game Info</h2>
        <p><strong>Room:</strong> {roomId}</p>
        <p><strong>You:</strong> {playerName}</p>
        <p><strong>Opponent:</strong> {opponentName}</p>
        <p><strong>Moves:</strong> {moves}</p>
        <p><strong>Time:</strong> {time}s</p>

        <ProgressBar label="Your Progress" value={myProgress} />
        <ProgressBar label="Opponent Progress" value={opponentProgress} />
      </div>

      <div className="board-panel card">
        <h2>Your Board</h2>
        <PuzzleBoard board={board} onTileClick={onTileClick} />
      </div>
    </div>
  );
}

function PuzzleBoard({ board, onTileClick }) {
  return (
    <div className="board">
      {board.map((tile, index) => (
        <button
          key={index}
          className={`tile ${tile === 0 ? "empty" : ""}`}
          onClick={() => tile !== 0 && onTileClick(index)}
          disabled={tile === 0}
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