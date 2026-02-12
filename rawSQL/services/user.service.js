import pool from "../db.js";

export const findUserById = async (id) => {
  const result = await pool.query("SELECT id, username, role FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
};

export const updateUserRole = async (id, role) => {
  await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
};

export const isAdmin = (user) => user?.role === "admin";
