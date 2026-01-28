import { useState, useEffect } from "react";
import { cars } from "./data/cars";
import { useTheme } from "./hooks/useTheme";
import { PlayerNameModal } from "./components/PlayerNameModal";
import { LeaderboardModal } from "./components/LeaderboardModal";
import {
  getPlayerName,
  savePlayerName,
  addLeaderboardEntry,
} from "./utils/leaderboard";
import "./App.css";

/* =======================
   COMPARAÇÃO DO JOGO
======================= */
function compareAttribute(guess, answer, type = "equal") {
  if (type === "equal") {
    return guess === answer ? "correct" : "neutral";
  }

  if (type === "number") {
    if (guess === answer) return "correct";
    return guess > answer ? "down" : "up";
  }

  if (type === "category") {
    return guess === answer ? "correct" : "neutral";
  }

  return "neutral";
}

/* =======================
   ATRIBUTOS
======================= */
const ATTRIBUTES = [
  { key: "brand", label: "Marca", type: "equal", getValue: (car) => car.brand },
  {
    key: "bodyStyle",
    label: "Tipo",
    type: "equal",
    getValue: (car) => car.bodyStyle,
  },
  {
    key: "doors",
    label: "Portas",
    type: "number",
    getValue: (car) => car.doors,
  },
  {
    key: "engineDisplacement",
    label: "Motor",
    type: "number",
    getValue: (car) => car.engine?.displacement,
  },
  { key: "year", label: "Ano", type: "number", getValue: (car) => car.year },
  {
    key: "engineValves",
    label: "Válvulas",
    type: "number",
    getValue: (car) => car.engine?.valves,
  },
  {
    key: "aspiration",
    label: "Aspiração",
    type: "equal",
    getValue: (car) => car.engine?.aspiration,
  },
  {
    key: "fuel",
    label: "Combustível",
    type: "equal",
    getValue: (car) => car.fuel,
  },
  {
    key: "traction",
    label: "Tração",
    type: "equal",
    getValue: (car) => car.traction,
  },
  {
    key: "transmission",
    label: "Câmbio",
    type: "equal",
    getValue: (car) => car.transmission,
  },
  {
    key: "category",
    label: "Categoria",
    type: "category",
    getValue: (car) => car.category,
  },
];

function getRandomCar() {
  return cars[Math.floor(Math.random() * cars.length)];
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [answerCar, setAnswerCar] = useState(getRandomCar());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  
  // Player and Leaderboard state
  const [playerName, setPlayerName] = useState(() => getPlayerName());
  const [showNameModal, setShowNameModal] = useState(() => !getPlayerName());
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  
  const MAX_ATTEMPTS = 10;

  // Save to leaderboard when player wins or loses
  useEffect(() => {
    if (hasWon && playerName && guesses.length > 0) {
      const carGuessed = getCarLabel(answerCar);
      addLeaderboardEntry(playerName, guesses.length, "win", carGuessed);
    }
  }, [hasWon, playerName, guesses.length, answerCar]);

  useEffect(() => {
    if (hasWon) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hasWon]);
  
  useEffect(() => {
    if (hasLost && playerName && guesses.length > 0) {
      const carGuessed = getCarLabel(answerCar);
      addLeaderboardEntry(playerName, guesses.length, "loss", carGuessed);
    }
  }, [hasLost, playerName, guesses.length, answerCar]);

  const normalizedSearch = normalizeText(searchTerm);
  const searchTokens = normalizedSearch.split(" ").filter(Boolean);
  const filteredCars =
    searchTokens.length === 0
      ? []
      : cars
          .map((car) => {
            const searchIndex = buildSearchIndex(car);
            const score = getSearchMatchScore(searchTokens, searchIndex);
            return score === null ? null : { car, score, searchIndex };
          })
          .filter(Boolean)
          .sort((a, b) => {
            if (a.score !== b.score) {
              return a.score - b.score;
            }
            return a.searchIndex.localeCompare(b.searchIndex, "pt-BR");
          })
          .map(({ car }) => car);

  const previewCar = selectedCar;
  const showResults = searchTokens.length > 0 && !selectedCar;

  function handleSearchChange(nextValue) {
    const normalizedValue = normalizeText(nextValue);
    const exactMatch = cars.find(
      (car) => buildSearchIndex(car) === normalizedValue
    );

    setSearchTerm(nextValue);
    setSelectedCar(exactMatch ?? null);
  }

  function handleConfirm() {
    if (!previewCar || hasWon || hasLost) return;

    const newGuesses = [previewCar, ...guesses];
    setGuesses(newGuesses);

    if (previewCar.id === answerCar.id) {
      setHasWon(true);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setHasLost(true);
    }

    setSearchTerm("");
    setSelectedCar(null);
  }

  function resetGame() {
    setAnswerCar(getRandomCar());
    setGuesses([]);
    setHasWon(false);
    setHasLost(false);
    setSearchTerm("");
    setSelectedCar(null);
  }

  function handleSavePlayerName(name) {
    savePlayerName(name);
    setPlayerName(name);
    setShowNameModal(false);
    
    // Reset game when changing player
    if (guesses.length > 0 || hasWon) {
      resetGame();
    }
  }

  return (
    <div className="app">
      {hasWon && (
        <div className="confetti-overlay" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, index) => (
            <span
              key={index}
              className="confetti-piece"
              style={{
                "--left": `${2 + (index % 12) * 8}%`,
                "--delay": `${index * 0.05}s`,
                "--duration": `${2.4 + (index % 6) * 0.35}s`,
                "--x": `${(index % 6) * 6 - 15}px`,
              }}
            />
          ))}
        </div>
      )}
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="var(--accent)" />
                <path
                  d="M8 16L14 10L18 14L24 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="header-text">
              <h1 className="title">CarGuess</h1>
              <p className="subtitle">Adivinhe o carro pelas características</p>
            </div>
          </div>
          
          {!hasWon && !hasLost && (
            <div className="attempts-counter">
              <span className="counter-label">Tentativas</span>
              <span className="counter-value">
                {guesses.length}/{MAX_ATTEMPTS}
              </span>
            </div>
          )}
          
          <div className="header-actions">
            {playerName && (
              <button
                className="player-badge"
                onClick={() => setShowNameModal(true)}
                aria-label="Trocar jogador"
                title={`Jogador: ${playerName}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="player-name-text">{playerName}</span>
              </button>
            )}
            <button
              className="theme-toggle"
              onClick={() => setShowLeaderboardModal(true)}
              aria-label="Ver placar"
              title="Ver placar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 2v4M15 2v4M9 14h6M9 18h6M6 10h12M5 22h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Alternar tema"
            >
              {theme === "light" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" fill="currentColor" />
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main">
        <div className="container">
          {/* VICTORY */}
          {hasWon && (
            <div className="victory-card">
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span
                    key={index}
                    className="confetti-piece"
                    style={{
                      "--left": `${8 + (index % 6) * 16}%`,
                      "--delay": `${index * 0.12}s`,
                      "--duration": `${2.6 + (index % 4) * 0.4}s`,
                    }}
                  />
                ))}
              </div>
              <div className="victory-icon">🎉</div>
              <h2>Parabéns!</h2>
              <p>
                Você acertou em{" "}
                <strong>
                  {guesses.length} {guesses.length === 1 ? "tentativa" : "tentativas"}
                </strong>
              </p>
              <div className="victory-car">
                <strong>
                  {answerCar.brand} {answerCar.model}
                </strong>
                <span className="victory-meta">
                  {getCarLabel(answerCar)}
                </span>
              </div>
              <button className="button-primary" onClick={resetGame}>
                Jogar novamente
              </button>
            </div>
          )}

          {/* GUESSES */}
          {guesses.length === 0 && !hasWon && !hasLost && (
            <div className="empty-state">
              <div className="empty-icon">🚗</div>
              <h3>Comece a jogar!</h3>
              <p>Busque um carro abaixo e faça sua primeira tentativa</p>
            </div>
          )}

          {guesses.map((car, index) => (
            <div key={index} className="guess-card">
              <div className="guess-header">
                <span className="guess-number">#{guesses.length - index}</span>
                <h3 className="guess-title">
                  {car.brand} {car.model}
                </h3>
              </div>

              <div className="attributes-grid">
                {ATTRIBUTES.map((attr) => {
                  const result = compareAttribute(
                    attr.getValue(car),
                    attr.getValue(answerCar),
                    attr.type
                  );
                  const displayValue = attr.getValue(car);

                  return (
                    <div
                      key={attr.key}
                      className={`attribute-cell ${result}`}
                    >
                      <span className="attribute-label">{attr.label}</span>
                      <span className="attribute-value">
                        {displayValue}
                        {attr.type === "number" && result === "up" && " ↑"}
                        {attr.type === "number" && result === "down" && " ↓"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* LOSS */}
          {hasLost && (
            <div className="loss-card">
              <div className="loss-icon">😅</div>
              <h2>Que pena!</h2>
              <p>
                Você atingiu o limite de{" "}
                <strong>{MAX_ATTEMPTS} tentativas</strong>
              </p>
              <div className="loss-car">
                <span className="loss-label">O carro era:</span>
                <strong>
                  {answerCar.brand} {answerCar.model}
                </strong>
                <span className="loss-meta">
                  {getCarLabel(answerCar)}
                </span>
              </div>
              <button className="button-primary" onClick={resetGame}>
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM BAR */}
      {!hasWon && !hasLost && (
        <div className="bottom-bar">
          <div className="container">
            {/* SEARCH */}
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Busque por marca, modelo ou ano..."
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    className="search-clear"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCar(null);
                    }}
                    aria-label="Limpar busca"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* SEARCH RESULTS */}
              {showResults && (
                <div className="search-results">
                  {filteredCars.length === 0 ? (
                    <div className="empty-results">
                      <span>Nenhum carro encontrado</span>
                    </div>
                  ) : (
                    filteredCars.slice(0, 8).map((car) => (
                      <button
                        key={car.id}
                        className="search-result-item"
                        onClick={() => {
                          setSelectedCar(car);
                          setSearchTerm(getCarLabel(car));
                        }}
                      >
                        <div className="result-main">
                          <strong>{getCarLabel(car)}</strong>
                        </div>
                        <div className="result-meta">
                          {car.bodyStyle} · {car.category}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* PREVIEW */}
            {previewCar && (
              <div className="preview-card">
                <div className="preview-header">
                  <span className="preview-label">Selecionado:</span>
                  <strong className="preview-car">
                    {previewCar.brand} {previewCar.model}
                  </strong>
                </div>
                <div className="preview-attributes">
                  {ATTRIBUTES.slice(0, 6).map((attr) => (
                    <span key={attr.key} className="preview-attr">
                      {attr.label}: <strong>{attr.getValue(previewCar)}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CONFIRM BUTTON */}
            <button
              className="button-primary"
              onClick={handleConfirm}
              disabled={!previewCar}
            >
              Confirmar tentativa
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showNameModal && (
        <PlayerNameModal
          onSave={handleSavePlayerName}
          onClose={() => setShowNameModal(false)}
          currentPlayerName={playerName}
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal
          onClose={() => setShowLeaderboardModal(false)}
          currentPlayerName={playerName}
        />
      )}
    </div>
  );
}

export default App;

/* =======================
   UTILITY FUNCTIONS
======================= */
function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchIndex(car) {
  return normalizeText(
    [
      car.brand,
      car.model,
      car.trim,
      car.generationOrChassis,
      car.bodyStyle,
      car.year,
      car.category,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function getCarLabel(car) {
  const labelParts = [
    car.brand,
    car.model,
    car.generationOrChassis,
    car.trim,
  ].filter(Boolean);
  const baseLabel = labelParts.join(" ");
  return car.year ? `${baseLabel} (${car.year})` : baseLabel;
}

function isTokenMatch(token, searchIndex) {
  if (searchIndex.includes(token)) return true;
  const words = searchIndex.split(" ");
  return words.some((word) => levenshteinDistance(word, token) <= 1);
}

function getSearchMatchScore(tokens, searchIndex) {
  let score = 0;
  for (const token of tokens) {
    if (searchIndex.includes(token)) {
      continue;
    }
    const words = searchIndex.split(" ");
    const hasFuzzyMatch = words.some(
      (word) => levenshteinDistance(word, token) <= 1
    );
    if (!hasFuzzyMatch) return null;
    score += 1;
  }
  return score;
}

function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}
