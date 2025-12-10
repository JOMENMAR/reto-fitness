// src/components/Scoreboard.jsx
import { useCallback } from "react";

function computeScores(activities, participants, activeSeason) {
  const map = new Map();

  participants.forEach((p) => {
    map.set(p.id, 0);
  });

  // puntos por actividades
  activities.forEach((a) => {
    if (!map.has(a.participantId)) return;
    const prev = map.get(a.participantId) ?? 0;
    map.set(a.participantId, prev + a.points);
  });

  // puntos iniciales de la temporada
  const initial = (activeSeason && activeSeason.initialPoints) || {};
  Object.entries(initial).forEach(([id, pts]) => {
    if (!map.has(id)) return;
    const prev = map.get(id) ?? 0;
    map.set(id, prev + (Number(pts) || 0));
  });

  const array = participants.map((p) => ({
    participant: p,
    points: map.get(p.id) ?? 0,
  }));

  array.sort((a, b) => b.points - a.points);

  return array.map((item, index) => ({
    ...item,
    position: item.points === 0 ? null : index + 1,
    medal:
      index === 0 && item.points > 0
        ? "🥇"
        : index === 1 && item.points > 0
        ? "🥈"
        : index === 2 && item.points > 0
        ? "🥉"
        : "",
  }));
}

export function Scoreboard({
  activities,
  participants,
  activeSeason,
  onResetSeason,
  onEditTotal,
}) {
  const handleEditClick = useCallback(
    (participantId, currentPoints, name) => {
      if (!onEditTotal) return;

      const input = window.prompt(
        `Nuevo total de puntos para ${name}:`,
        String(currentPoints)
      );
      if (input === null) return; // cancel

      onEditTotal(participantId, input, currentPoints);
    },
    [onEditTotal]
  );

  if (!activeSeason) {
    return (
      <section className="card">
        <h2>Clasificación</h2>
        <p className="muted">
          Crea y selecciona una temporada para ver la clasificación.
        </p>
      </section>
    );
  }

  const scores = computeScores(activities, participants, activeSeason);

  return (
    <section className="card">
      <div className="card-header-row">
        <h2>Clasificación – {activeSeason.name}</h2>
        <button className="danger-btn" onClick={onResetSeason}>
          Resetear temporada
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Posición</th>
            <th>Nombre</th>
            <th>Puntos</th>
            <th>Medalla</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {scores.map(({ participant, points, position, medal }) => (
            <tr key={participant.id}>
              <td>{position ?? "-"}</td>
              <td>{participant.name}</td>
              <td>{points}</td>
              <td>{medal}</td>
              <td>
                {onEditTotal && (
                  <button
                    className="primary-btn"
                    style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    onClick={() =>
                      handleEditClick(participant.id, points, participant.name)
                    }
                  >
                    Editar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
