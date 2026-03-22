import { useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AUTH_METHODS, setLastAuthMethod } from "../lib/authFlow";
import "./Modal.css";
import "./AuthModal.css";

const AUTH_ICON_SRC = "/logo-turbo-lupa.png";

const AUTH_VIEWS = {
  LOGIN: "login",
  SIGNUP: "signup",
};

function getRedirectUrl() {
  const redirectUrl = new URL(window.location.href);
  redirectUrl.hash = "";
  redirectUrl.search = "";
  return redirectUrl.toString();
}

function getErrorText(error, fallback) {
  return error instanceof Error && error.message
    ? `Erro: ${error.message}`
    : fallback;
}

function isAlreadyRegisteredError(error) {
  if (!(error instanceof Error) || !error.message) return false;

  const normalized = error.message.toLowerCase();
  return (
    normalized.includes("already registered") ||
    normalized.includes("user already registered") ||
    normalized.includes("already exists")
  );
}

function looksLikeExistingSignupResult(user) {
  return Array.isArray(user?.identities) && user.identities.length === 0;
}

export function AuthModal({ authError = "" }) {
  const [view, setView] = useState(AUTH_VIEWS.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  function resetFeedback() {
    setHasInteracted(true);
    setFeedback(null);
  }

  function updateView(nextView) {
    setView(nextView);
    resetFeedback();
    setPassword("");
    setConfirmPassword("");
  }

  async function sendMagicLink() {
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
        text: "Digite um email válido para receber o link.",
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
          text: getErrorText(error, "Erro ao enviar o link de acesso."),
        });
        return;
      }

      setLastAuthMethod(AUTH_METHODS.MAGIC_LINK);
      setFeedback({
        tone: "success",
        text: `Link de acesso enviado para ${trimmedEmail}.`,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text: getErrorText(error, "Erro ao enviar o link de acesso."),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
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
        text: "Digite um email válido para entrar.",
      });
      return;
    }

    if (password.length < 6) {
      setFeedback({
        tone: "error",
        text: "Digite sua senha para entrar.",
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setFeedback({
          tone: "error",
          text: "Email ou senha incorretos.",
        });
        return;
      }

      setLastAuthMethod(AUTH_METHODS.PASSWORD);
      setFeedback({
        tone: "success",
        text: "Login realizado com sucesso.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text: getErrorText(error, "Erro ao realizar login."),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event) {
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
        text: "Digite um email válido para cadastrar.",
      });
      return;
    }

    if (password.length < 6) {
      setFeedback({
        tone: "error",
        text: "A senha precisa ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({
        tone: "error",
        text: "As senhas precisam ser iguais.",
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            has_password: true,
          },
        },
      });

      if (error) {
        setFeedback({
          tone: isAlreadyRegisteredError(error) ? "warning" : "error",
          text: isAlreadyRegisteredError(error)
            ? "Esse email já está cadastrado. Use a tela de login."
            : getErrorText(error, "Erro ao criar sua conta."),
        });
        return;
      }

      if (looksLikeExistingSignupResult(data.user)) {
        setFeedback({
          tone: "warning",
          text: "Esse email já parece estar cadastrado. Use a tela de login.",
        });
        return;
      }

      if (data.session) {
        setLastAuthMethod(AUTH_METHODS.PASSWORD);
        setFeedback({
          tone: "success",
          text: "Conta criada com sucesso. Você já está dentro do jogo.",
        });
        setPassword("");
        setConfirmPassword("");
        return;
      }

      setFeedback({
        tone: "success",
        text:
          "Cadastro iniciado. Verifique seu email para confirmar a conta e liberar o login.",
      });
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setFeedback({
        tone: "error",
        text: getErrorText(error, "Erro ao criar sua conta."),
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
            <span className="auth-chip">Garagem autenticada</span>
          </div>

          <h2 className="modal-title">
            {view === AUTH_VIEWS.LOGIN ? "Entrar no Car Guess" : "Criar conta"}
          </h2>
          <p className="modal-subtitle">
            {view === AUTH_VIEWS.LOGIN
              ? "Entre com email e senha. Se preferir, use um magic link como atalho."
              : "Cadastre seu email para criar uma conta com senha e entrar sempre que quiser."}
          </p>
        </div>

        <form
          onSubmit={view === AUTH_VIEWS.LOGIN ? handleLogin : handleSignup}
          className="modal-form auth-form"
        >
          <div className="auth-view-toggle" role="tablist" aria-label="Ações de autenticação">
            <button
              type="button"
              className={`auth-view-button ${view === AUTH_VIEWS.LOGIN ? "active" : ""}`}
              onClick={() => updateView(AUTH_VIEWS.LOGIN)}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-view-button ${view === AUTH_VIEWS.SIGNUP ? "active" : ""}`}
              onClick={() => updateView(AUTH_VIEWS.SIGNUP)}
            >
              Cadastro
            </button>
          </div>

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
                resetFeedback();
              }}
              placeholder="voce@email.com"
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="form-group auth-password-group">
            <label htmlFor="auth-password" className="form-label">
              {view === AUTH_VIEWS.LOGIN ? "Sua senha" : "Crie uma senha"}
            </label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                resetFeedback();
              }}
              placeholder={
                view === AUTH_VIEWS.LOGIN
                  ? "Digite sua senha"
                  : "Minimo de 6 caracteres"
              }
              autoComplete={
                view === AUTH_VIEWS.LOGIN ? "current-password" : "new-password"
              }
              required
            />
          </div>

          {view === AUTH_VIEWS.SIGNUP && (
            <div className="form-group auth-password-group">
              <label htmlFor="auth-confirm-password" className="form-label">
                Confirmar senha
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  resetFeedback();
                }}
                placeholder="Repita sua senha"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          <div className="auth-note">
            <span className="auth-note-label">Como funciona</span>
            <p>
              {view === AUTH_VIEWS.LOGIN
                ? "No login comum, o email e a senha precisam bater exatamente. Se quiser entrar pelo email, use o botão de magic link abaixo."
                : "No cadastro, a conta é criada com email e senha. Se o email já estiver em uso, você deve voltar para a tela de login."}
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
              {loading
                ? view === AUTH_VIEWS.LOGIN
                  ? "Entrando..."
                  : "Cadastrando..."
                : view === AUTH_VIEWS.LOGIN
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </div>

          {view === AUTH_VIEWS.LOGIN && (
            <div className="auth-secondary-actions">
              <button
                type="button"
                className="auth-magic-link-button"
                onClick={sendMagicLink}
                disabled={loading || !isSupabaseConfigured}
              >
                Entrar com magic link
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
