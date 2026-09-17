const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Health
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

// Listar usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM usuarios ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Obtener usuario
app.get("/usuarios/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// Crear usuario
app.post("/usuarios", async (req, res) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({
      error: "Nombre y email son obligatorios"
    });
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValido.test(email)) {
    return res.status(400).json({
      error: "El email no tiene un formato válido"
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *",
      [nombre, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: "Error al crear usuario"
    });
  }
});

// Actualizar usuario
app.put("/usuarios/:id", async (req, res) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({
      error: "Nombre y email son obligatorios"
    });
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValido.test(email)) {
    return res.status(400).json({
      error: "El email no tiene un formato válido"
    });
  }

  try {
    const result = await pool.query(
      "UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING *",
      [nombre, email, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar usuario"
    });
  }
});

// Eliminar usuario
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    res.json({
      mensaje: "Usuario eliminado",
      usuario: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar usuario"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ejecutándose en el puerto ${PORT}`);
});