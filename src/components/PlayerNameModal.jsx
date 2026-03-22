import { useState } from "react";
import { getKnownPlayers } from "../utils/leaderboard";
import "./Modal.css";
import "./PlayerNameModal.css";

export function PlayerNameModal({
  onSave,
  onClose,
  currentPlayerName,
  loading = false,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const knownPlayers = getKnownPlayers().filter((p) => p !== currentPlayerName);

  function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Por favor, digite seu nome");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      return;
    }

    if (trimmedName.length > 20) {
      setError("Nome deve ter no máximo 20 caracteres");
      return;
    }

    onSave(trimmedName);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content player-name-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon">👋</div>
          <h2 className="modal-title">
            {currentPlayerName ? "Editar perfil" : "Bem-vindo ao CarGuess!"}
          </h2>
          <p className="modal-subtitle">
            {currentPlayerName
              ? "Selecione um nome conhecido ou defina um novo nome público"
              : "Digite seu nome para começar a jogar e competir no placar"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {knownPlayers.length > 0 && (
            <div className="known-players">
              <label className="form-label">Jogadores conhecidos</label>
              <div className="players-grid">
                {knownPlayers.map((player) => (
                  <button
                    key={player}
                    type="button"
                    className="player-button"
                    onClick={() => onSave(player)}
                    disabled={loading}
                  >
                    <span className="player-icon">👤</span>
                    <span className="player-name">{player}</span>
                  </button>
                ))}
              </div>
              <div className="divider">
                <span>ou</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="player-name" className="form-label">
              {knownPlayers.length > 0 ? "Novo jogador" : "Seu nome"}
            </label>
            <input
              id="player-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Digite seu nome..."
              autoFocus={knownPlayers.length === 0}
              maxLength={20}
            />
            {error && <span className="form-error">{error}</span>}
          </div>

          <div className="modal-actions">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading
                ? "Salvando..."
                : currentPlayerName
                  ? "Salvar perfil"
                  : "Começar a jogar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
