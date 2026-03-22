import { useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import "./Modal.css";
import "./AuthModal.css";

const AUTH_ICON_SRC = "/logo-turbo-lupa.png";

function getRedirectUrl() {
  const redirectUrl = new URL(window.location.href);
  redirectUrl.hash = "";
  redirectUrl.search = "";
  return redirectUrl.toString();
}

export function AuthModal({ authError = "" }) {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const configurationMessage = !isSupabaseConfigured
    ? "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local para liberar o login."
    : "";
  const externalFeedback =
    configurationMessage || (!hasInteracted ? authError : "");
  const activeFeedback = feedback ?? (
    externalFeedback
      ? {
          tone: configurationMessage ? "warning" : "error",
          text: externalFeedback,
        }
      : null
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setHasInteracted(true);

    if (!supabase || !isSupabaseConfigured) {
      setFeedback({
        tone: "warning",
        text: configurationMessage,
      });
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setFeedback({
        tone: "error",
        text: "Digite um email válido para receber o link de acesso.",
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        setFeedback({
          tone: "error",
          text: `Erro: ${error.message}`,
        });
        return;
      }

      setFeedback({
        tone: "success",
        text: `Link de acesso enviado para ${trimmedEmail}.`,
      });
      setEmail("");
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? `Erro: ${error.message}`
            : "Erro ao iniciar o login. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-content auth-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header auth-modal-header">
          <div className="auth-brand-lockup">
            <img
              className="auth-brand-icon"
              src={AUTH_ICON_SRC}
              alt="Car Guess"
            />
            <span className="auth-chip">Acesso por email</span>
          </div>

          <h2 className="modal-title">Entrar no Car Guess</h2>
          <p className="modal-subtitle">
            Receba um link mágico no seu email para liberar a partida sem senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form auth-form">
          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Seu email
            </label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setHasInteracted(true);
                setFeedback(null);
              }}
              placeholder="voce@email.com"
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="auth-note">
            <span className="auth-note-label">Como funciona</span>
            <p>
              O acesso acontece pelo link enviado no email. Abra a mensagem e
              volte para o jogo no mesmo navegador.
            </p>
          </div>

          {activeFeedback && (
            <div
              className={`auth-feedback is-${activeFeedback.tone}`}
              role={activeFeedback.tone === "error" ? "alert" : "status"}
            >
              {activeFeedback.text}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="submit"
              className="button-primary"
              disabled={loading || !isSupabaseConfigured}
            >
              {loading ? "Enviando link..." : "Receber link de acesso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
