// src/components/AddPoints.jsx
import { useState } from "react";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getPointsForDay(activities, seasonId, participantId, date) {
  if (!seasonId || !date) return 0;

  return activities
    .filter((a) => a.participantId === participantId && a.date === date)
    .reduce((sum, a) => sum + a.points, 0);
}

function canAddPoints(
  activities,
  seasonId,
  participantId,
  date,
  extraPoints,
  maxPerDay
) {
  const current = getPointsForDay(activities, seasonId, participantId, date);
  return current + extraPoints <= maxPerDay;
}

export function AddPoints({
  activities,
  participants,
  activeSeason,
  onAddActivity,
}) {
  const [selectedDate, setSelectedDate] = useState(todayISO());

  if (!activeSeason) {
    return (
      <section className="card">
        <h2>Añadir puntos</h2>
        <p className="muted">
          Crea y selecciona una temporada para empezar a sumar puntos.
        </p>
      </section>
    );
  }

  const effectiveDate =
    selectedDate && selectedDate.trim() !== "" ? selectedDate : todayISO();
  const dailyLimit = activeSeason.dailyLimit ?? 2;

  function handleClick(participantId) {
    if (
      !canAddPoints(
        activities,
        activeSeason.id,
        participantId,
        effectiveDate,
        1,
        dailyLimit
      )
    ) {
      alert(`Máximo ${dailyLimit} puntos por persona y día 👮‍♂️`);
      return;
    }

    onAddActivity(participantId, effectiveDate);
  }

  return (
    <section className="card">
      <h2>Añadir puntos</h2>

      <div className="date-row">
        <label>
          Fecha:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            placeholder={todayISO()}
          />
        </label>
        <button
          type="button"
          className="nav-btn"
          onClick={() => setSelectedDate(todayISO())}
        >
          Hoy
        </button>
      </div>

      <div className="participants-grid">
        {participants.map((p) => {
          const todayPoints = getPointsForDay(
            activities,
            activeSeason.id,
            p.id,
            effectiveDate
          );
          const remaining = Math.max(0, dailyLimit - todayPoints);

          return (
            <div key={p.id} className="participant-card">
              <div className="participant-name">{p.name}</div>
              <div className="participant-sub">
                {effectiveDate}: {todayPoints} / {dailyLimit} puntos
              </div>
              <button
                className="add-btn"
                onClick={() => handleClick(p.id)}
                disabled={remaining <= 0}
              >
                +1 punto
              </button>
              {remaining <= 0 && (
                <div className="limit-text">Límite diario alcanzado</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
