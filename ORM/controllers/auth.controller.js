import bcrypt from 'bcrypt'; //ini buat enkripsi data di database
import jwt from 'jsonwebtoken'; //buat import web token 
import KurirPaket from '../services/kurirPaket.js';
import crypto from "crypto";
import {prisma} from '../../lib/prisma.js'

//register page api endpoint
export const register = async(req, res) => { //router post untuk input data ke database biasanya.
    try {
        
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message : 'All fields are required!'})
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

        // const results = await pool.query(
        //     'INSERT INTO users (username, email_adress, password) VALUES ($1, $2, $3) RETURNING id, username, email_adress',
        //     [username, email, hashedPassword]
        // )

        const result = await prisma.users.create({
            data: {
                username: username,
                email_adress: email,
                password: hashedPassword
            },
        })

        res.status(201).json({ 
            message: "created, you can login now",
            id: result.id,
            username: result.username,
            email: result.email_adress });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ 
                message: 'Email Already Exist'})
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
} 

//login page api endpoint
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required!'});
        }

        const result = await prisma.users.findUnique({
            where: {
                email_adress: email
            }
        });

        if (!result) {
            return res.status(404).json({ message: 'User not Found'});
        }

        const isPasswordValid = await bcrypt.compare(password, result.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials'});
        }

        const token = jwt.sign(
            {
                id: result.id,
                username: result.username
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        res.status(200).json({ 
            message: 'Login successful',
            token: token,
            user: {
                user_id: result.id,
                username: result.username
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

        const oldPassword = await prisma.users.findUnique({
            where: {
                id: id 
            },
            select: {
                password: true
            }
        })

        if(!oldPassword){
            return res.status(404).json({ message: "user tidak ditemukan" })
        }

        const oldHashedPasswordFromDB = oldPassword.password

        //validate password sama dengan di db, kalo beda, return 401
        const isOldPasswordMatch = await bcrypt.compare(password, oldHashedPasswordFromDB)

        if(!isOldPasswordMatch){
            return res.status(401).json({ message: "password tidak matching, harap periksa kembali" })
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10)

        await prisma.users.update({
            where:{
                id: id
            },
            data:{
                password: hashedNewPassword,
                password_changed_at: new Date()
            }
        })
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

        await prisma.users.update({
            data:{
                reset_password_token: hashedToken,
                reset_password_expires: expires,
            },
            where:{
                email_adress: email
            }
        })
        
        const resetLink = `http://localhost:3000/api/forgot-password?token=${resetToken}`
        const resetTokenOnly = resetLink
        await KurirPaket(email, resetLink, resetTokenOnly)
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

        const user = await prisma.users.findFirst({
            where:{
                reset_password_token: hashedToken,
                reset_password_expires: {
                    gt: new Date()
                }
            },
            select: {
                id: true
            }
        })

        if (!user){
            return res.status(400).json({ message: "token invalid/expired" })
        }

        if (!token || !newPassword) {
            return res.status(400).json({ message: "token dan password wajib ada" });
        }

        const id = user.id
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.users.updateMany({
            data: {
                reset_password_token: null,
                reset_password_expires: null,
                password: hashedPassword
            },
            where: {
                id: id
            }
        })

        res.status(200).json({ message: "password telah berubah, harap relog"})
    } catch(error) {
        console.error(error)
        res.status(500).json({ message: "server error, cek log" })
    }
}