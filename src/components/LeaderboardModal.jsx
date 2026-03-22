import { formatDate } from "../utils/leaderboard";
import "./Modal.css";
import "./LeaderboardModal.css";

export function LeaderboardModal({
  onClose,
  currentUserId,
  entries = [],
  loading = false,
  errorMessage = "",
  weekLabel = "",
}) {
  const hasEntries = entries.length > 0;
  const subtitle = errorMessage
    ? "O ranking nao conseguiu carregar."
    : loading
      ? "Buscando os pilotos mais fortes da semana."
      : weekLabel
        ? `Semana atual: ${weekLabel}`
        : "Placar semanal do Car Guess";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">🏆</div>
          <h2 className="modal-title">Placar Semanal</h2>
          <p className="modal-subtitle">{subtitle}</p>
        </div>

        <div className="leaderboard-content">
          {errorMessage ? (
            <div className="leaderboard-empty">
              <div className="empty-icon">⚠️</div>
              <p>{errorMessage}</p>
            </div>
          ) : loading ? (
            <div className="leaderboard-empty">
              <div className="empty-icon">⏳</div>
              <p>Carregando ranking...</p>
            </div>
          ) : !hasEntries ? (
            <div className="leaderboard-empty">
              <div className="empty-icon">🎮</div>
              <p>Ninguem pontuou nesta semana ainda.</p>
            </div>
          ) : (
            <div className="leaderboard-list">
              {entries.map((entry, index) => {
                const isCurrentPlayer = entry.userId === currentUserId;
                const position = index + 1;
                const positionClass = position <= 3 ? `position-${position}` : "";
                const bestAttemptsLabel = entry.bestAttempts
                  ? `${entry.bestAttempts} tent.`
                  : "sem vitoria";
                const avgAttemptsLabel = entry.avgAttempts
                  ? `${entry.avgAttempts} tent.`
                  : "sem media";

                return (
                  <div
                    key={entry.userId}
                    className={`leaderboard-item ${isCurrentPlayer ? "is-current" : ""} ${positionClass}`}
                  >
                    <div className="item-position">
                      {position === 1 && "🥇"}
                      {position === 2 && "🥈"}
                      {position === 3 && "🥉"}
                      {position > 3 && `#${position}`}
                    </div>

                    <div className="item-details">
                      <div className="item-header">
                        <span className="item-name">{entry.displayName}</span>
                        {isCurrentPlayer && <span className="item-badge">Você</span>}
                      </div>
                      <div className="item-info">
                        <span className="item-car">
                          {entry.wins} vitorias · {entry.gamesPlayed} partidas
                        </span>
                      </div>
                      <div className="item-meta">
                        <span>
                          Melhor: {bestAttemptsLabel} · Media: {avgAttemptsLabel} ·
                          Ultima: {formatDate(entry.lastGameAt)}
                        </span>
                      </div>
                    </div>

                    <div className="item-stats">
                      <div className="stat-badge score-badge">
                        {entry.totalPoints} pts
                      </div>
                      <div className="result-badge result-win">
                        {entry.wins} {entry.wins === 1 ? "vitoria" : "vitorias"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
