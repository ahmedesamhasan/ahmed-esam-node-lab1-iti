const express = require("express");
const router = express.Router();

const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  query
} = require("../helpers/DB");

const AUTH = {
  JWT_SECRET: "super_secret_change_me",
  BCRYPT_ROUNDS: 12
};

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(255).required(),
  age: Joi.number().integer().min(13).max(120).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(1).required()
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing Bearer token"
    });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, AUTH.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
}

router.post("/auth/register", async (req, res) => {
  const {
    error,
    value
  } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details.map(d => d.message)
    });
  }

  const {
    name,
    email,
    password,
    age
  } = value;

  try {
    const exists = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) {
      return res.status(409).json({
        error: "Email already in use"
      });
    }

    const password_hash = await bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);

    const result = await query(
      "INSERT INTO users (name, email, password_hash, age) VALUES (?, ?, ?, ?)",
      [name, email, password_hash, age]
    );

    const rows = await query(
      "SELECT id, name, email, age, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      user: rows[0]
    });
  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      message: e.message
    });
  }
});

router.post("/auth/login", async (req, res) => {
  const {
    error,
    value
  } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details.map(d => d.message)
    });
  }

  const {
    email,
    password
  } = value;

  try {
    const rows = await query(
      "SELECT id, email, password_hash FROM users WHERE email = ?",
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign({
        id: user.id,
        email: user.email
      },
      AUTH.JWT_SECRET, {
        expiresIn: AUTH.EXPIRES_IN
      }
    );

    return res.status(200).json({
      token
    });
  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      message: e.message
    });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, name, email, age, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({
        error: "User not found"
      });
    }
    return res.status(200).json({
      profile: rows[0]
    });
  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      message: e.message
    });
  }
});

module.exports = router;
