// src/components/SeasonSelector.jsx
import { useState } from "react";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function SeasonSelector({
  seasons,
  activeSeasonId,
  onChangeActiveSeason,
  onCreateSeason,
  allParticipants,
}) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [dailyLimit, setDailyLimit] = useState(2);

  // por defecto, todos activos
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(allParticipants.map((p) => p.id))
  );

  const [initialPoints, setInitialPoints] = useState(() => {
    const obj = {};
    allParticipants.forEach((p) => {
      obj[p.id] = 0;
    });
    return obj;
  });

  function toggleParticipant(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateInitialPoints(id, value) {
    setInitialPoints((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const trimmed = name.trim();
    const seasonName = trimmed || `Temporada ${seasons.length + 1}`;
    const start = startDate || todayISO();
    const limit = Number.isFinite(Number(dailyLimit)) ? Number(dailyLimit) : 2;

    const participants = Array.from(selectedIds);
    const cleanInitialPoints = {};
    participants.forEach((id) => {
      const raw = Number(initialPoints[id] ?? 0);
      cleanInitialPoints[id] = Number.isFinite(raw) ? raw : 0;
    });

    onCreateSeason({
      name: seasonName,
      startDate: start,
      dailyLimit: limit,
      participants,
      initialPoints: cleanInitialPoints,
    });

    // reset nombre pero mantenemos otras cosas por comodidad
    setName("");
  }

  return (
    <section className="season-card">
      <div className="season-row">
        <div>
          <h2>Temporadas</h2>
          {seasons.length === 0 ? (
            <p className="muted">Crea la primera temporada para empezar.</p>
          ) : (
            <select
              className="season-select"
              value={activeSeasonId || ""}
              onChange={(e) => onChangeActiveSeason(e.target.value)}
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <form className="season-form" onSubmit={handleSubmit}>
        <div className="season-form-row">
          <input
            type="text"
            placeholder="Nombre nueva temporada"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="number"
            min="1"
            step="1"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            placeholder="Límite/día"
          />
          <button type="submit" className="primary-btn">
            + Crear temporada
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <p className="muted" style={{ marginBottom: 4 }}>
            Integrantes y puntos iniciales:
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 6,
            }}
          >
            {allParticipants.map((p) => (
              <label
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggleParticipant(p.id)}
                />
                <span style={{ minWidth: 60 }}>{p.name}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={initialPoints[p.id] ?? 0}
                  onChange={(e) =>
                    updateInitialPoints(p.id, Number(e.target.value))
                  }
                  className="points-input"
                  style={{ maxWidth: 70 }}
                />
              </label>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
}
