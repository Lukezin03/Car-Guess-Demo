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
    if (!previewCar || hasWon) return;

    setGuesses((prev) => [previewCar, ...prev]);

    if (previewCar.id === answerCar.id) {
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
                attr.getValue(car),
                attr.getValue(answerCar),
                attr.type
              );
              const displayValue = attr.getValue(car);

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
                    {displayValue}
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
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Busque marca, modelo ou ano (ex: civic 2010)"
              style={styles.searchInput}
            />
            {showResults && (
              <div style={styles.searchResults}>
                {filteredCars.length === 0 && (
                  <span style={styles.emptyResult}>
                    Nenhum carro encontrado.
                  </span>
                )}
                {filteredCars.slice(0, 8).map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    style={styles.searchOption}
                    onClick={() => {
                      setSelectedCar(car);
                      setSearchTerm(getCarLabel(car));
                    }}
                  >
                    <strong>{getCarLabel(car)}</strong>{" "}
                    <span style={styles.optionMeta}>
                      {car.bodyStyle} · {car.category}
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
                  <strong>{attr.label}:</strong> {attr.getValue(previewCar)}
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
  return normalizeText(
    [
      car.brand,
      car.model,
      car.trim,
      car.generationOrChassis,
      car.bodyStyle,
      car.year,
      // Não incluir car.engine?.displacement se já está no trim
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
    // Não incluir car.engine?.displacement se já está no trim
  ].filter(Boolean);
  const baseLabel = labelParts.join(" ");
  return car.year ? `${baseLabel} (${car.year})` : baseLabel;
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
    fontSize: "16px", // <- isso impede o zoom no iOS
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
  },
  searchResults: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "52px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    zIndex: 2,
    maxHeight: "240px",
    overflowY: "auto",
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
