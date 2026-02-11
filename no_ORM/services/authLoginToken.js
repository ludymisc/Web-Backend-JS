import jwt from "jsonwebtoken"; // Library JWT untuk verifikasi & decoding JSON Web Token
import pool from "../db/db.js"; //minta connection string db karna token akan masuk ke db
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' })

const AuthLoginToken = async (req, res, next) => { // next adalah fungsi Express untuk melanjutkan request ke middleware berikutnya
    const authHeader = req.headers.authorization; //request header tambahan selain content-type, yaitu
    //authorization, yang akan diisi token dari jwt payload nantinya
    // Authorization header berisi skema Bearer dan JWT token

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    } //blok ini adalah validasi jika lupa menambahkan header authorization

    // pastikan format: Bearer <token>
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid token format" });
    } //split antara Bearer dan token dengan spasi agar format terbaca

    const token = parts[1]; //index dimulainya token dari header authorization setelah di split dengan spasi

    try {
        // 1️⃣ verify JWT (signature + exp)
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"], //ini hashing punya jwt
        }); // decoded berisi payload JWT setelah signature & expiry diverifikasi

        // 2️⃣ ambil password_changed_at dari DB
        const result = await pool.query(
            "SELECT password_changed_at FROM users WHERE id = $1",
            [decoded.id] //query untuk ngambil kapan user terakhir mengganti password
            // Gunakan user id dari payload JWT untuk mengambil password_changed_at
        ); 

        if (result.rowCount === 0) {
            return res.status(401).json({ message: "User not found" });
        } //validasi jika query tadi jika user tidak ada. 

        const passwordChangedAt = result.rows[0].password_changed_at;
        //baris ini mengambil hasil query pertama dan assign ke variabel tertera

        // 3️⃣ bandingin iat token vs waktu ganti password
        if (passwordChangedAt) {
            const passwordChangedAtUnix =
                new Date(passwordChangedAt).getTime() / 1000;
            
            if (decoded.iat < passwordChangedAtUnix) {
                return res.status(401).json({
                    message: "Token expired, password already changed",
                });
            } //intinya kalo kolom passwordchangedat punya waktu lebih besar dari iat(kapan token didapat).
            //maka token akan expired dan user harus login ulang
        }

        // 4️⃣ attach user ke request
        req.user = decoded; 
        next(); //contoh disini, next berfungsi sebagai sinyal lulus setelah req.user masuk ke decoded
        // Menandakan autentikasi berhasil dan request boleh lanjut
    } catch (err) {
        return res.status(401).json({ message: "Token invalid or expired" });
        //ini kalo ada error server atau human error aneh, ngarahnya kesini, console.error aja kalo perlu
    }
};

export default AuthLoginToken;
