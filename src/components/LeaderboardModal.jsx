import { getLeaderboard, formatDate } from "../utils/leaderboard";
import "./LeaderboardModal.css";

export function LeaderboardModal({ onClose, currentPlayerName }) {
  const leaderboard = getLeaderboard();
  const hasEntries = leaderboard.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">🏆</div>
          <h2 className="modal-title">Placar</h2>
          <p className="modal-subtitle">
            {hasEntries
              ? `Top ${leaderboard.length} melhores desempenhos`
              : "Nenhuma partida registrada ainda"}
          </p>
        </div>

        <div className="leaderboard-content">
          {!hasEntries ? (
            <div className="leaderboard-empty">
              <div className="empty-icon">🎮</div>
              <p>Seja o primeiro a aparecer no placar!</p>
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((entry, index) => {
                const isCurrentPlayer = entry.playerName === currentPlayerName;
                const position = index + 1;
                const positionClass = position <= 3 ? `position-${position}` : "";

                return (
                  <div
                    key={entry.id}
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
                        <span className="item-name">{entry.playerName}</span>
                        {isCurrentPlayer && <span className="item-badge">Você</span>}
                      </div>
                      <div className="item-info">
                        <span className="item-car">{entry.carGuessed}</span>
                      </div>
                      <div className="item-meta">
                        <span>{formatDate(entry.timestamp)}</span>
                      </div>
                    </div>

                    <div className="item-stats">
                      <div className="stat-badge">
                        {entry.attempts} {entry.attempts === 1 ? "tent." : "tent."}
                      </div>
                      {entry.result === "win" ? (
                        <div className="result-badge result-win">Vitória</div>
                      ) : (
                        <div className="result-badge result-loss">Derrota</div>
                      )}
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
