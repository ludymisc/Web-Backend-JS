import nodemailer from "nodemailer" //library node untuk mengirimkan email ke client
import dotenv from 'dotenv' //biasa, dotenv

dotenv.config({ path: "../../.env"}) //ngikut bareng dotenv

async function KurirPaket(email, resetLink) { //fungsi menerima email tujuan dan memberikan reset link ke client
    const transporter = nodemailer.createTransport({ //transport itu syntax buat penugasan kurir
        service: "gmail", //service untuk jenis email, kalo yahoo beda lagi
        // Menggunakan preset SMTP Gmail
        auth: { //set autentifikasi untuk email kurir ke client
            user: process.env.EMAIL_USER, //alamat email kurir 
            pass: process.env.EMAIL_PASSWORD, //password akun email kurir
            // App password Gmail (bukan password akun)
        },
    });
        
    await transporter.sendMail({ //nunggu janji transporter kalo udah siap, langsung berangkat ngirim email
        from: `"MyApp Support" <${process.env.EMAIL_USER}>`, //ini semua format default email
        to: email,
        subject: "Reset Password",
        text: `Klik link ini untuk reset password:
    ${resetLink}
    
    Link berlaku 15 menit.`,
    });
} export default KurirPaket