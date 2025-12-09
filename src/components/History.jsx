// src/components/History.jsx
import { useMemo, useState } from "react";

export function History({
  activities,
  participants,
  activeSeason,
  onUpdateActivity,
  onDeleteActivity,
}) {
  const [filterParticipantId, setFilterParticipantId] = useState("all");

  const activitiesForSeason = useMemo(() => {
    if (!activeSeason) return [];
    return activities.filter((a) => a.seasonId === activeSeason.id);
  }, [activities, activeSeason]);

  const filtered = useMemo(() => {
    let list = [...activitiesForSeason];
    if (filterParticipantId !== "all") {
      list = list.filter((a) => a.participantId === filterParticipantId);
    }
    list.sort((a, b) => {
      if (a.date === b.date) {
        return a.participantId.localeCompare(b.participantId);
      }
      return a.date.localeCompare(b.date);
    });
    return list;
  }, [activitiesForSeason, filterParticipantId]);

  function getNameById(id) {
    return participants.find((p) => p.id === id)?.name ?? id;
  }

  if (!activeSeason) {
    return (
      <section className="card">
        <h2>Histórico</h2>
        <p className="muted">
          Crea y selecciona una temporada para ver el histórico.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-header-row">
        <h2>Histórico – {activeSeason.name}</h2>
        <select
          className="season-select"
          value={filterParticipantId}
          onChange={(e) => setFilterParticipantId(e.target.value)}
        >
          <option value="all">Todos</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="muted">Todavía no hay actividades en esta temporada.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre</th>
              <th>Puntos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>{a.date}</td>
                <td>{getNameById(a.participantId)}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="points-input"
                    value={a.points}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (Number.isNaN(value) || value < 0) return;
                      onUpdateActivity(a.id, value);
                    }}
                  />
                </td>
                <td>
                  <button
                    className="small-danger"
                    onClick={() => onDeleteActivity(a.id)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
