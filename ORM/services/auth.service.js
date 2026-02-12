import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

export const hashPassword = (password) => bcrypt.hash(password, 10);

export const comparePassword = (password, hashed) => bcrypt.compare(password, hashed);

export const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const findUserByUsername = async (username) => {
  const result = await pool.query(
    "SELECT id, username, password FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0] || null;
};
