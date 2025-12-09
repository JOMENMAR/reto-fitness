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
}) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(todayISO());

  function handleSubmit(e) {
    e.preventDefault();

    const trimmed = name.trim();
    onCreateSeason({
      name: trimmed || `Temporada ${seasons.length + 1}`,
      startDate: startDate || todayISO(),
    });

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
          <button type="submit" className="primary-btn">
            + Crear temporada
          </button>
        </div>
      </form>
    </section>
  );
}
