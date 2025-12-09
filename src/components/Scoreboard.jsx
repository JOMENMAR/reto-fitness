// src/components/Scoreboard.jsx

function computeScores(activities, participants, seasonId) {
  const map = new Map();

  participants.forEach((p) => {
    map.set(p.id, 0);
  });

  activities
    .filter((a) => a.seasonId === seasonId)
    .forEach((a) => {
      const prev = map.get(a.participantId) ?? 0;
      map.set(a.participantId, prev + a.points);
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
}) {
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

  const scores = computeScores(activities, participants, activeSeason.id);

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
          </tr>
        </thead>
        <tbody>
          {scores.map(({ participant, points, position, medal }) => (
            <tr key={participant.id}>
              <td>{position ?? "-"}</td>
              <td>{participant.name}</td>
              <td>{points}</td>
              <td>{medal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
