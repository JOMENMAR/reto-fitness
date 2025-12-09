// src/components/AdminPanel.jsx
import React from "react";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminPanel({ activeSeason, onAdminBoost }) {
  if (!activeSeason) return null;

  // Estos son los boosts que quieres meter de vez en cuando en T2
  // Interpretamos: "sumar +11, +13, +10", NO poner totales absolutos.
  const boosts = [];

  return (
    <section className="card admin-card">
      <h2>Zona admin – Boost de puntos</h2>
      <p className="muted">
        Estos botones añaden puntos directamente en la temporada actual (
        {activeSeason.name}). Se guardan como actividades con la fecha de hoy (
        {todayISO()}).
      </p>
      <div className="admin-buttons-row">
        {boosts.map((b) => (
          <button
            key={b.participantId}
            type="button"
            className="primary-btn"
            onClick={() => onAdminBoost(b.participantId, b.points)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </section>
  );
}
