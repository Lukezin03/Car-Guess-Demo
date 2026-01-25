/* =======================
   LEADERBOARD UTILITIES
   Sistema de persistência e gerenciamento do placar
======================= */

const STORAGE_KEYS = {
  PLAYER_NAME: "carguess_player_name",
  LEADERBOARD: "carguess_leaderboard",
  KNOWN_PLAYERS: "carguess_known_players",
};

const MAX_LEADERBOARD_ENTRIES = 10;
const MAX_KNOWN_PLAYERS = 20;

/* =======================
   PLAYER NAME
======================= */
export function getPlayerName() {
  try {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || null;
  } catch (error) {
    console.error("Error reading player name:", error);
    return null;
  }
}

export function savePlayerName(name) {
  try {
    const trimmedName = name.trim();
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, trimmedName);
    
    // Add to known players list
    addKnownPlayer(trimmedName);
    
    return true;
  } catch (error) {
    console.error("Error saving player name:", error);
    return false;
  }
}

/* =======================
   LEADERBOARD
======================= */
export function getLeaderboard() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading leaderboard:", error);
    return [];
  }
}

function saveLeaderboard(entries) {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error("Error saving leaderboard:", error);
    return false;
  }
}

export function addLeaderboardEntry(playerName, attempts, result, carGuessed) {
  const entry = {
    id: generateId(),
    playerName: playerName.trim(),
    attempts,
    result, // "win" ou "loss"
    carGuessed,
    timestamp: Date.now(),
    date: new Date().toISOString(),
  };

  const leaderboard = getLeaderboard();
  leaderboard.push(entry);

  // Ordenar: vitórias primeiro, depois por menos tentativas, depois por mais recente
  const sorted = leaderboard.sort((a, b) => {
    // Vitórias primeiro
    if (a.result !== b.result) {
      return a.result === "win" ? -1 : 1;
    }

    // Se ambos venceram ou perderam, ordenar por tentativas
    if (a.attempts !== b.attempts) {
      return a.attempts - b.attempts;
    }

    // Se tentativas iguais, mais recente primeiro
    return b.timestamp - a.timestamp;
  });

  // Limitar ao máximo de entradas
  const limited = sorted.slice(0, MAX_LEADERBOARD_ENTRIES);

  saveLeaderboard(limited);
  return entry;
}

export function clearLeaderboard() {
  try {
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
    return true;
  } catch (error) {
    console.error("Error clearing leaderboard:", error);
    return false;
  }
}

/* =======================
   KNOWN PLAYERS
======================= */
export function getKnownPlayers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.KNOWN_PLAYERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading known players:", error);
    return [];
  }
}

function addKnownPlayer(name) {
  try {
    const players = getKnownPlayers();
    const trimmedName = name.trim();
    
    // Remove if already exists (to move to front)
    const filtered = players.filter(p => p !== trimmedName);
    
    // Add to front
    filtered.unshift(trimmedName);
    
    // Limit to max
    const limited = filtered.slice(0, MAX_KNOWN_PLAYERS);
    
    localStorage.setItem(STORAGE_KEYS.KNOWN_PLAYERS, JSON.stringify(limited));
    return true;
  } catch (error) {
    console.error("Error adding known player:", error);
    return false;
  }
}

/* =======================
   UTILITIES
======================= */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
