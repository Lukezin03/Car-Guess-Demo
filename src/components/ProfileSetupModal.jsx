import { useState } from "react";
import "./Modal.css";

export function ProfileSetupModal({
  onSave,
  loading = false,
  errorMessage = "",
}) {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmed = displayName.trim();

    if (!trimmed) {
      setError("Digite um nome.");
      return;
    }

    if (trimmed.length < 2) {
      setError("O nome deve ter pelo menos 2 caracteres.");
      return;
    }

    if (trimmed.length > 20) {
      setError("O nome deve ter no máximo 20 caracteres.");
      return;
    }

    onSave(trimmed);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">👤</div>
          <h2 className="modal-title">Complete seu perfil</h2>
          <p className="modal-subtitle">
            Escolha o nome que aparecerá no jogo e no ranking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="display-name" className="form-label">
              Nome público
            </label>
            <input
              id="display-name"
              type="text"
              className="form-input"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setError("");
              }}
              placeholder="Ex: Lucas"
              maxLength={20}
              autoFocus
            />
            {(error || errorMessage) && (
              <span className="form-error">{error || errorMessage}</span>
            )}
          </div>

          <div className="modal-actions">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
