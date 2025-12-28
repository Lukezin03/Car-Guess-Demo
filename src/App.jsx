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
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [hasWon, setHasWon] = useState(false);

  const brands = [...new Set(cars.map((car) => car.brand))];
  const modelsByBrand = cars.filter((car) => car.brand === selectedBrand);

  const previewCar = cars.find(
    (c) => c.brand === selectedBrand && c.model === selectedModel
  );

  function handleConfirm() {
    if (!previewCar || hasWon) return;

    setGuesses((prev) => [previewCar, ...prev]);

    if (previewCar.model === answerCar.model) {
      setHasWon(true);
    }

    setSelectedBrand("");
    setSelectedModel("");
  }

  function resetGame() {
    setAnswerCar(getRandomCar());
    setGuesses([]);
    setHasWon(false);
    setSelectedBrand("");
    setSelectedModel("");
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
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
            }}
            style={{
              width: "100%",
              padding: "8px",
              height: "44px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
          >
            <option value="">Marca</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand}
            style={{
              width: "100%",
              padding: "8px",
              height: "44px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
          >
            <option value="">Modelo</option>
            {modelsByBrand.map((car) => (
              <option key={car.model} value={car.model}>
                {car.model}
              </option>
            ))}
          </select>

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
