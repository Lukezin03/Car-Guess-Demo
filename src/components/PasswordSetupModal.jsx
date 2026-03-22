import { useState } from "react";
import "./Modal.css";
import "./PasswordSetupModal.css";

export function PasswordSetupModal({
  email = "",
  onSave,
  loading = false,
  errorMessage = "",
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    onSave(password);
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-content password-setup-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon">🔑</div>
          <h2 className="modal-title">Crie sua senha</h2>
          <p className="modal-subtitle">
            {email
              ? `Voce entrou com o link enviado para ${email}.`
              : "Voce entrou com o link mágico do email."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="password-setup-note">
            Salve uma senha agora para entrar mais rápido na próxima vez, sem
            depender do email.
          </div>

          <div className="form-group">
            <label htmlFor="new-password" className="form-label">
              Nova senha
            </label>
            <input
              id="new-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Minimo de 6 caracteres"
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div className="form-group password-setup-group">
            <label htmlFor="confirm-password" className="form-label">
              Confirmar senha
            </label>
            <input
              id="confirm-password"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
              placeholder="Repita sua senha"
              autoComplete="new-password"
            />
            {(error || errorMessage) && (
              <span className="form-error">{error || errorMessage}</span>
            )}
          </div>

          <div className="modal-actions">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? "Salvando senha..." : "Salvar senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
