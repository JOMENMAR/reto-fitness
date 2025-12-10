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
  // ===== TEMPORADAS =====
  const [seasons, setSeasons] = useState([]);
  const [activeSeasonId, setActiveSeasonId] = useState(null);

  useEffect(() => {
    const seasonsRef = ref(db, "seasons");
    return onValue(seasonsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map((id) => ({ id, ...data[id] }));
      setSeasons(list);

      if (list.length > 0 && !activeSeasonId) {
        setActiveSeasonId(list[0].id);
      }
    });
  }, []);

  const activeSeason = useMemo(
    () => seasons.find((s) => s.id === activeSeasonId) || null,
    [seasons, activeSeasonId]
  );

  // PARTICIPANTES activos de la temporada
  const participantsForSeason = useMemo(() => {
    if (!activeSeason || !activeSeason.participants) {
      // fallback: todos
      return PARTICIPANTS;
    }
    const ids = new Set(activeSeason.participants);
    return PARTICIPANTS.filter((p) => ids.has(p.id));
  }, [activeSeason]);

  function handleCreateSeason({
    name,
    startDate,
    dailyLimit,
    participants,
    initialPoints,
  }) {
    // valores por defecto por si algo viene undefined
    const payload = {
      name,
      startDate,
      dailyLimit: dailyLimit ?? 2,
      participants:
        participants && participants.length > 0
          ? participants
          : PARTICIPANTS.map((p) => p.id),
      initialPoints: initialPoints || {},
    };

    push(ref(db, "seasons"), payload);
  }

  function handleChangeSeason(id) {
    setActiveSeasonId(id);
  }

  // ===== ACTIVIDADES =====
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!activeSeason) {
      return;
    }

    const activitiesRef = ref(db, `activities/${activeSeason.id}`);
    return onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map((id) => ({ id, ...data[id] }));
      setActivities(list);
    });
  }, [activeSeason?.id]); // mejor depender solo del id

  // Añadir actividad normal (1 punto)
  function handleAddActivity(participantId, date) {
    if (!activeSeason) return;

    push(ref(db, `activities/${activeSeason.id}`), {
      participantId,
      date,
      points: 1,
    });
  }

  // Boost admin (p.e. Kevin +11)
  function handleAdminBoost(participantId, points) {
    if (!activeSeason) return;

    push(ref(db, `activities/${activeSeason.id}`), {
      participantId,
      date: todayISO(),
      points,
    });
  }

  function handleResetSeason() {
    if (!activeSeason) return;

    const ok = window.confirm(
      `¿Seguro que quieres borrar TODAS las actividades de ${activeSeason.name}?`
    );
    if (!ok) return;

    remove(ref(db, `activities/${activeSeason.id}`));
  }

  function handleUpdateActivity(activityId, newPoints) {
    if (!activeSeason) return;
    update(ref(db, `activities/${activeSeason.id}/${activityId}`), {
      points: newPoints,
    });
  }

  function handleDeleteActivity(activityId) {
    if (!activeSeason) return;

    const ok = window.confirm("¿Seguro que quieres borrar esta actividad?");
    if (!ok) return;

    remove(ref(db, `activities/${activeSeason.id}/${activityId}`));
  }

  function handleEditTotal(participantId, newTotal, currentTotal) {
    if (!activeSeason) return;

    const parsedNew = Number(newTotal);
    if (!Number.isFinite(parsedNew) || parsedNew < 0) {
      alert("Introduce un número válido (0 o más).");
      return;
    }

    const delta = parsedNew - currentTotal;
    if (delta === 0) {
      return; // nada que cambiar
    }

    // Creamos una actividad "ajuste" con la diferencia
    push(ref(db, `activities/${activeSeason.id}`), {
      participantId,
      date: todayISO(),
      points: delta, // puede ser positivo o negativo
    });
  }

  const [selectedView, setSelectedView] = useState("score");

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
        allParticipants={PARTICIPANTS}
      />

      <AdminPanel activeSeason={activeSeason} onAdminBoost={handleAdminBoost} />

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

      <main className="content">
        {selectedView === "score" && (
          <Scoreboard
            activities={activities}
            participants={participantsForSeason}
            activeSeason={activeSeason}
            onResetSeason={handleResetSeason}
            onEditTotal={handleEditTotal}
          />
        )}

        {selectedView === "add" && (
          <AddPoints
            activities={activities}
            participants={participantsForSeason}
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
