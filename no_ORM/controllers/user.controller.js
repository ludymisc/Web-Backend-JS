import pool from "../db/db.js";

//end point route for user info
export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(req.user)

        const result = await pool.query(
            "SELECT id, username FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

//change user role by admin end point
export const changeRole = async(req, res) => {
    try{
        const { id } = req.params;
        const { role } = req.body;

        if(!['admin', 'user'].includes(role)) {
            res.status(400).json({ message: "role tidak valid" })
        }

        if(Number(id) === req.user.id) {
            res.status(400).json({ message: "gak bisa mengubah role sendiri, admin bloon" })
        }

        await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2',
            [role, id]
        )

        res.json({ message: "role telah berubah, cek aja kalo gak percaya" })
    } catch (error){
        res.status(500).json({ message: "cek kode atau database, ini backend, errornya gak jauh" })
    }
}