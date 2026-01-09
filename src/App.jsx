import { useState } from "react";
import { cars } from "./data/cars";

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
  { key: "brand", label: "Marca", type: "equal" },
  { key: "type", label: "Tipo", type: "equal" },
  { key: "doors", label: "Portas", type: "number" },
  { key: "engine", label: "Motor", type: "number" },
  { key: "decade", label: "Década", type: "number" },
  { key: "valves", label: "Válvulas", type: "number" },
  { key: "aspiration", label: "Aspiração", type: "equal" },
  { key: "fuel", label: "Combustível", type: "equal" },
  { key: "traction", label: "Tração", type: "equal" },
  { key: "transmission", label: "Câmbio", type: "equal" },
  { key: "category", label: "Categoria", type: "category" },
];

function getRandomCar() {
  return cars[Math.floor(Math.random() * cars.length)];
}

function App() {
  const [answerCar, setAnswerCar] = useState(getRandomCar());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [hasWon, setHasWon] = useState(false);

  const normalizedSearch = normalizeText(searchTerm);
  const searchTokens = normalizedSearch.split(" ").filter(Boolean);
  const filteredCars =
    searchTokens.length === 0
      ? []
      : cars.filter((car) =>
          searchTokens.every((token) =>
            isTokenMatch(token, buildSearchIndex(car))
          )
        );

  const previewCar = selectedCar;

  function handleConfirm() {
    if (!previewCar || hasWon) return;

    setGuesses((prev) => [previewCar, ...prev]);

    if (previewCar.model === answerCar.model) {
      setHasWon(true);
    }

    setSearchTerm("");
    setSelectedCar(null);
  }

  function resetGame() {
    setAnswerCar(getRandomCar());
    setGuesses([]);
    setHasWon(false);
    setSearchTerm("");
    setSelectedCar(null);
  }

  return (
    <main style={styles.app}>
      <header style={styles.header}>
        <h1>Car Guess</h1>
        <p>Descubra o carro pelas características</p>
      </header>

      {/* =======================
          TENTATIVAS
      ======================= */}
      {guesses.map((car, index) => (
        <section key={index} style={styles.card}>
          <h2>
            #{guesses.length - index} — {car.brand} {car.model}
          </h2>

          <div style={styles.grid}>
            {ATTRIBUTES.map((attr) => {
              const result = compareAttribute(
                car[attr.key],
                answerCar[attr.key],
                attr.type
              );

              return (
                <div
                  key={attr.key}
                  style={{
                    ...styles.cell,
                    backgroundColor:
                      result === "correct"
                        ? "#4caf50"
                        : result === "up" || result === "down"
                        ? "#ff9800"
                        : "#e0e0e0",
                  }}
                >
                  <small style={styles.label}>{attr.label}</small>

                  <strong style={styles.value}>
                    {car[attr.key]}
                    {attr.type === "number" && result === "up" && (
                      <span> ↑</span>
                    )}
                    {attr.type === "number" && result === "down" && (
                      <span> ↓</span>
                    )}
                  </strong>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* =======================
          VITÓRIA
      ======================= */}
      {hasWon && (
        <section style={styles.card}>
          <h2>🎉 Você acertou!</h2>
          <button style={styles.button} onClick={resetGame}>
            Adivinhar outro carro
          </button>
        </section>
      )}

      {/* =======================
          BARRA INFERIOR
      ======================= */}
      {!hasWon && (
        <div style={styles.bottomBar}>
          <div style={styles.searchWrapper}>
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSelectedCar(null);
              }}
              placeholder="Busque marca, modelo ou ano (ex: civic 2010)"
              style={styles.searchInput}
            />
            {searchTokens.length > 0 && (
              <div style={styles.searchResults}>
                {filteredCars.length === 0 && (
                  <span style={styles.emptyResult}>
                    Nenhum carro encontrado.
                  </span>
                )}
                {filteredCars.slice(0, 8).map((car) => (
                  <button
                    key={`${car.brand}-${car.model}-${car.decade}-${car.engine}`}
                    type="button"
                    style={styles.searchOption}
                    onClick={() => {
                      setSelectedCar(car);
                      setSearchTerm(`${car.brand} ${car.model} ${car.decade}`);
                    }}
                  >
                    <strong>
                      {car.brand} {car.model}
                    </strong>{" "}
                    <span style={styles.optionMeta}>
                      {car.decade} · {car.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PREVIEW (SEM COMPARAÇÃO) */}
          {previewCar && (
            <div style={styles.preview}>
              {ATTRIBUTES.map((attr) => (
                <span key={attr.key}>
                  <strong>{attr.label}:</strong> {previewCar[attr.key]}
                </span>
              ))}
            </div>
          )}

          <button
            style={styles.button}
            disabled={!previewCar}
            onClick={handleConfirm}
          >
            Confirmar tentativa
          </button>
        </div>
      )}
    </main>
  );
}

export default App;

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
  return normalizeText(`${car.brand} ${car.model} ${car.decade}`);
}

function isTokenMatch(token, searchIndex) {
  if (searchIndex.includes(token)) return true;
  const words = searchIndex.split(" ");
  return words.some((word) => levenshteinDistance(word, token) <= 1);
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

/* =======================
   ESTILOS
======================= */
const styles = {
  app: {
    minHeight: "100vh",
    padding: "16px",
    paddingBottom: "220px",
    fontFamily: "system-ui",
    background: "#ffffff",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  card: {
    background: "#f5f5f5",
    borderRadius: "12px",
    padding: "16px",
    maxWidth: "480px",
    margin: "0 auto 12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "6px",
    marginTop: "12px",
  },
  cell: {
    borderRadius: "6px",
    padding: "6px",
    textAlign: "center",
    fontSize: "12px",
    color: "#000",
  },
  label: {
    fontSize: "10px",
    opacity: 0.7,
  },
  value: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "4px",
  },
  bottomBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    borderTop: "1px solid #ddd",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  searchWrapper: {
    position: "relative",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px",
    height: "44px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
  },
  searchResults: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "48px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    zIndex: 2,
  },
  searchOption: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid transparent",
    background: "#f7f7f7",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "13px",
  },
  optionMeta: {
    fontSize: "11px",
    opacity: 0.7,
  },
  emptyResult: {
    padding: "8px",
    fontSize: "12px",
    opacity: 0.7,
  },
  preview: {
    fontSize: "11px",
    opacity: 0.7,
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    background: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
