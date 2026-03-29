const BASE_URL = "http://localhost:4000";

export async function createRoom(playerName) {
  const res = await fetch(`${BASE_URL}/create-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });

  if (!res.ok) {
    throw new Error("Failed to create room");
  }

  return res.json();
}

export async function joinRoom(roomId, playerName) {
  const res = await fetch(`${BASE_URL}/join-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, playerName }),
  });

  if (!res.ok) {
    throw new Error("Failed to join room");
  }

  return res.json();
}

export async function markReady(roomId, playerName) {
  const res = await fetch(`${BASE_URL}/ready`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, playerName }),
  });

  if (!res.ok) {
    throw new Error("Failed to mark ready");
  }

  return res.json();
}

export async function getRoom(roomId) {
  const res = await fetch(`${BASE_URL}/room/${roomId}`);

  if (!res.ok) {
    throw new Error("Failed to get room");
  }

  return res.json();
}