import { useState, useMemo, useEffect } from "react";
import { SeasonSelector } from "./components/SeasonSelector";
import { Scoreboard } from "./components/Scoreboard";
import { AddPoints } from "./components/AddPoints";
import { History } from "./components/History";
import { AdminPanel } from "./components/AdminPanel";
import { ParticipantsManager } from "./components/ParticipantsManager";

import { db } from "./firebase";
import { ref, onValue, push, update, remove } from "firebase/database";
import "./index.css";

// Usamos este array SOLO como semilla inicial si en Firebase no hay participantes
import { PARTICIPANTS as DEFAULT_PARTICIPANTS } from "./data/participants";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  // ===== TEMPORADAS =====
  const [seasons, setSeasons] = useState([]);
  const [activeSeasonId, setActiveSeasonId] = useState(null);
  const [participants, setParticipants] = useState([]);

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

  useEffect(() => {
    const participantsRef = ref(db, "participants");

    return onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();

      if (data && Object.keys(data).length > 0) {
        const list = Object.keys(data).map((id) => ({
          id,
          name: data[id].name || id,
        }));
        setParticipants(list);
      } else {
        // Si no hay participantes en la BD, sembramos los por defecto
        const updates = {};
        DEFAULT_PARTICIPANTS.forEach((p) => {
          updates[p.id] = { name: p.name };
        });
        update(participantsRef, updates);
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
      return participants;
    }
    const ids = new Set(activeSeason.participants);
    return participants.filter((p) => ids.has(p.id));
  }, [activeSeason, participants]);

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
          : participants.map((p) => p.id),
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

  function handleDeleteSeason() {
    if (!activeSeason) return;

    const ok = window.confirm(
      `¿Seguro que quieres eliminar la temporada "${activeSeason.name}" y todas sus actividades? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    const seasonId = activeSeason.id;

    // Borramos actividades de esa temporada
    remove(ref(db, `activities/${seasonId}`));

    // Borramos la temporada en sí
    remove(ref(db, `seasons/${seasonId}`));

    // Limpiamos la temporada activa (el listener de seasons pondrá otra si existe)
    setActiveSeasonId(null);
  }

  function slugifyName(name) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleAddParticipant(name) {
    const id = slugifyName(name) || `p-${Date.now()}`;

    // Guardamos en /participants/{id}
    update(ref(db, `participants/${id}`), { name });
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
        allParticipants={participants}
        onDeleteSeason={handleDeleteSeason}
      />

      <ParticipantsManager
        participants={participants}
        onAddParticipant={handleAddParticipant}
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
            participants={participants}
            activeSeason={activeSeason}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        )}
      </main>
    </div>
  );
}
