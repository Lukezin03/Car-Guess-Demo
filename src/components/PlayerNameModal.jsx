import { useState } from "react";
import "./Modal.css";
import "./PlayerNameModal.css";

export function PlayerNameModal({
  onSave,
  onClose,
  onLogout,
  currentPlayerName,
  email = "",
  loading = false,
  errorMessage = "",
  logoutLoading = false,
}) {
  const [name, setName] = useState(currentPlayerName || "");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

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
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon">👤</div>
          <h2 className="modal-title">Seu perfil</h2>
          <p className="modal-subtitle">
            Esse email tem um único perfil no jogo. Você pode editar apenas o
            seu nome público.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="profile-summary">
            <div className="profile-current-name">
              <span className="profile-summary-label">Nome atual</span>
              <strong>{currentPlayerName || "Sem nome definido"}</strong>
            </div>
            {email && <div className="profile-email-chip">{email}</div>}
          </div>

          <div className="form-group profile-name-group">
            <label htmlFor="player-name" className="form-label">
              Alterar nome público
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
              autoFocus
              maxLength={20}
            />
            {(error || errorMessage) && (
              <span className="form-error">{error || errorMessage}</span>
            )}
          </div>

          <div className="modal-actions profile-modal-actions">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar nome"}
            </button>
            <button
              type="button"
              className="profile-logout-button"
              onClick={onLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? "Saindo..." : "Sair da conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
