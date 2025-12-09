# 🏋️ Reto Fitness – Temporadas + Clasificación en tiempo real

Aplicación web creada con **React + Vite**, sincronizada mediante **Firebase Realtime Database** para que todos los participantes puedan ver la clasificación, sumar puntos y gestionar temporadas en tiempo real.

Esta app permite llevar un reto fitness entre amigos (o cualquier actividad gamificada) con:

- Clasificación por temporadas
- Puntos por persona y por día
- Máximo 2 puntos/día por persona (modo normal)
- Puntos especiales de administrador (boosts)
- Histórico completo editable
- Multiusuario en tiempo real (cada uno desde su casa)

---

## 📸 Características principales

### ✔ Temporadas

- Crear nuevas temporadas
- Seleccionar temporada activa
- Resetear una temporada (borra sus actividades)

### ✔ Puntuación

- Añadir puntos con fecha automática o manual
- Límite 2 puntos/día/persona
- Boosts de admin (ej.: Kevin +11, Zaca +13, Adri +10)

### ✔ Histórico

- Ver todas las actividades ordenadas
- Editar puntos
- Borrar actividades
- Filtrar por participante

### ✔ En tiempo real

Todos los cambios se sincronizan gracias a **Firebase Realtime Database**.

---

## 🛠 Tech Stack

- **React** + **Vite**
- **Firebase Realtime Database**
- **CSS puro**
- **Vercel (deploy)**

---

## 📦 Instalación

Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/reto-fitness.git
cd reto-fitness
npm install
```
