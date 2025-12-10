// src/components/ParticipantsManager.jsx
import { useState } from "react";

export function ParticipantsManager({ participants, onAddParticipant }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    onAddParticipant(trimmed);
    setName("");
  }

  return (
    <section className="card">
      <h2>Participantes</h2>
      <p className="muted">
        Añade o revisa la lista de personas que pueden participar en los
        torneos.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 8, marginBottom: 12 }}>
        <div className="season-form-row">
          <input
            type="text"
            placeholder="Nombre del participante (ej. Kevin)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="primary-btn">
            + Añadir participante
          </button>
        </div>
      </form>

      {participants.length === 0 ? (
        <p className="muted">Todavía no hay participantes.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {participants.map((p) => (
            <li
              key={p.id}
              style={{
                padding: "4px 0",
                fontSize: "0.9rem",
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span>{p.name}</span>
              <span className="muted" style={{ fontSize: "0.75rem" }}>
                id: {p.id}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
