import bcrypt from 'bcrypt'; //ini buat enkripsi data di database
import pool from '../db/db.js'; //ini ngambil variabel pool dari db js tadi
import jwt from 'jsonwebtoken'; //buat import web token 
import KurirPaket from '../services/kurirPaket.js'; //ini fungsi yang akan mengirimkan email token reset password
import crypto from "crypto";

//register page api endpoint
export const register = async(req, res) => { //router post untuk input data ke database biasanya.
    try {
        
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message : 'All fields are required!'})
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await pool.query(
            'INSERT INTO users (username, email_adress, password) VALUES ($1, $2, $3) RETURNING id, username, email_adress',
            [username, email, hashedPassword]
        )
            

        res.status(201).json({ user: result.rows[0]});
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ message: 'Email Already Exist'})
        }

        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
} 

//login page api endpoint
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required!'});
        }

        const result = await pool.query(
            'SELECT id, username, password FROM users WHERE username = $1',
            [username]
        )

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials'});
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials'});
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        res.status(200).json({ 
            message: 'Login successful',
            token: token,
            user: {
                user_id: user.id,
                username: user.username
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
}

//change password end point api
export const changePassword = async(req,res) => {
    try {
        const id = req.user.id;
        const { password, newPassword } = req.body;

        if(!password || !newPassword){
            return res.status(400).json({ message: "ada kolom yang kosong, harap di isi" })
        }

        const oldPassword = await pool.query(
            'SELECT password FROM users WHERE id=$1',
            [id]
        )

        if(oldPassword.rowCount === 0){
            return res.status(404).json({ message: "user tidak ditemukan" })
        }

        const oldHashedPasswordFromDB = oldPassword.rows[0].password

        //validate password sama dengan di db, kalo beda, return 401
        const isOldPasswordMatch = await bcrypt.compare(password, oldHashedPasswordFromDB)

        if(!isOldPasswordMatch){
            return res.status(401).json({ message: "password tidak matching, harap periksa kembali" })
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10)

        await pool.query(
            'UPDATE users SET password = $1, password_changed_at = NOW() WHERE id = $2',
            [hashedNewPassword, id]
        )
    res.status(200).json({ message: "password telah diubah, harap login kembali" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "server error"})
    }
}

//forgot password end point
export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body
        const resetToken = crypto.randomBytes(32).toString("hex")
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        const expires = new Date(Date.now() + 15*60*1000)


        if(!email){
            return res.status(400).json({ message: "all field required" })
        }

        await pool.query(
            'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email_adress = $3',
            [hashedToken, expires, email]
        )
        
        const resetLink = `http://localhost:3000/api/forgot-password?token=${resetToken}`
        await KurirPaket(email, resetLink)
        res.json({ message: "jika email ada, kamu akan menerimanya sebentar lagi" })
    } catch (error) {
        res.status(500).json({ message: "server error, cek log" })
        console.error(error)
    }
}

//reset password end point
export const resetPassword = async(req, res) => {
    try {
        const { token, newPassword } = req.body

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        const { rows } = await pool.query(
            `SELECT id FROM users
            WHERE reset_password_token = $1
            AND
            reset_password_expires > NOW()`,
            
            [hashedToken]
        )

        if (rows.length === 0){
            return res.status(400).json({ message: "token invalid/expired" })
        }

        if (!token || !newPassword) {
            return res.status(400).json({ message: "token dan password wajib ada" });
        }

        const id = rows[0].id
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await pool.query(
            `UPDATE users SET password = $1,
            reset_password_token = NULL,
            reset_password_expires = NULL
            WHERE id = $2`,
            [hashedPassword, id]
        )

        res.status(200).json({ message: "password telah berubah, harap relog"})
    } catch(error) {
        console.error(error)
        res.status(500).json({ message: "server error, cek log" })
    }
}