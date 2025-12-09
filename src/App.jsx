// src/App.jsx
import { useState, useMemo, useEffect } from "react";
import { PARTICIPANTS } from "./data/participants";
import { SeasonSelector } from "./components/SeasonSelector";
import { Scoreboard } from "./components/Scoreboard";
import { AddPoints } from "./components/AddPoints";
import { History } from "./components/History";
import { AdminPanel } from "./components/AdminPanel";

import { db } from "./firebase";
import { ref, onValue, push, update, remove } from "firebase/database";

import "./index.css";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  // ============================
  // 🔥 TEMPORADAS (desde Firebase)
  // ============================
  const [seasons, setSeasons] = useState([]);
  const [activeSeasonId, setActiveSeasonId] = useState(null);

  useEffect(() => {
    const seasonsRef = ref(db, "seasons");
    return onValue(seasonsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map((id) => ({ id, ...data[id] }));
      setSeasons(list);

      // Si no hay temporada activa seleccionada, usar la primera
      if (list.length > 0 && !activeSeasonId) {
        setActiveSeasonId(list[0].id);
      }
    });
  }, []);

  const activeSeason = useMemo(
    () => seasons.find((s) => s.id === activeSeasonId) || null,
    [seasons, activeSeasonId]
  );

  function handleCreateSeason({ name, startDate }) {
    push(ref(db, "seasons"), {
      name,
      startDate,
    });
  }

  function handleChangeSeason(id) {
    setActiveSeasonId(id);
  }

  // ============================
  // 🔥 ACTIVIDADES (desde Firebase)
  // ============================
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!activeSeason) return;

    const activitiesRef = ref(db, `activities/${activeSeason.id}`);
    return onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map((id) => ({ id, ...data[id] }));
      setActivities(list);
    });
  }, [activeSeason]);

  // ============================
  // 🟢 Añadir actividad normal
  // ============================
  function handleAddActivity(participantId, date) {
    if (!activeSeason) return;

    push(ref(db, `activities/${activeSeason.id}`), {
      participantId,
      date,
      points: 1,
    });
  }

  // ============================
  // 🟡 Boost admin (11, 13, 10...)
  // ============================
  function handleAdminBoost(participantId, points) {
    if (!activeSeason) return;

    push(ref(db, `activities/${activeSeason.id}`), {
      participantId,
      date: todayISO(),
      points,
    });
  }

  // ============================
  // 🔧 Reset temporada
  // ============================
  function handleResetSeason() {
    if (!activeSeason) return;

    const ok = window.confirm(
      `¿Seguro que quieres borrar TODAS las actividades de ${activeSeason.name}?`
    );
    if (!ok) return;

    remove(ref(db, `activities/${activeSeason.id}`));
  }

  // ============================
  // ✏️ Editar actividad
  // ============================
  function handleUpdateActivity(activityId, newPoints) {
    if (!activeSeason) return;
    update(ref(db, `activities/${activeSeason.id}/${activityId}`), {
      points: newPoints,
    });
  }

  // ============================
  // 🗑 Borrar actividad
  // ============================
  function handleDeleteActivity(activityId) {
    if (!activeSeason) return;

    const ok = window.confirm("¿Seguro que quieres borrar esta actividad?");
    if (!ok) return;

    remove(ref(db, `activities/${activeSeason.id}/${activityId}`));
  }

  // ============================
  // 📌 Interfaz completa
  // ============================
  const [selectedView, setSelectedView] = useState("score"); // score | add | history

  return (
    <div className="app">
      <header className="app-header">
        <h1>Reto Fitness 🏋️</h1>
        <p className="subtitle">Temporadas compartidas en tiempo real</p>
      </header>

      <SeasonSelector
        seasons={seasons}
        activeSeasonId={activeSeason ? activeSeason.id : ""}
        onChangeActiveSeason={handleChangeSeason}
        onCreateSeason={handleCreateSeason}
      />

      {/* PANEL ADMIN */}
      <AdminPanel activeSeason={activeSeason} onAdminBoost={handleAdminBoost} />

      {/* NAV */}
      <nav className="nav">
        <button
          className={selectedView === "score" ? "nav-btn active" : "nav-btn"}
          onClick={() => setSelectedView("score")}
        >
          Clasificación
        </button>

        <button
          className={selectedView === "add" ? "nav-btn active" : "nav-btn"}
          onClick={() => setSelectedView("add")}
        >
          Añadir puntos
        </button>

        <button
          className={selectedView === "history" ? "nav-btn active" : "nav-btn"}
          onClick={() => setSelectedView("history")}
        >
          Histórico / Edición
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="content">
        {selectedView === "score" && (
          <Scoreboard
            activities={activities}
            participants={PARTICIPANTS}
            activeSeason={activeSeason}
            onResetSeason={handleResetSeason}
          />
        )}

        {selectedView === "add" && (
          <AddPoints
            activities={activities}
            participants={PARTICIPANTS}
            activeSeason={activeSeason}
            onAddActivity={handleAddActivity}
          />
        )}

        {selectedView === "history" && (
          <History
            activities={activities}
            participants={PARTICIPANTS}
            activeSeason={activeSeason}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        )}
      </main>
    </div>
  );
}
