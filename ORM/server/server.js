import express from 'express'; //api serveice untuk backend javaScript
import authRoutes from '../routes/auth.routes.js'; //memperpendek route api
import userRoutes from '../routes/user.routes.js'
import dotenv from 'dotenv' //biar bisa baca file dotenv
import { globalLimiter } from '../services/rateLimiter.js'

dotenv.config({ path: "../server/.env"}) //biar bisa baca config file dotenv

const app = express(); //pake. wajib. jangan ngide. gak harus app, bisa diganti "pisang"

app.use(express.json()); //parser data json
app.use('/api', authRoutes); //routing semua endpoint dengan prefix /api
app.use('/api', userRoutes); //routing semua endpoint dengan prefix /api
app.use(globalLimiter);

app.get('/test', (req, res) => {
    res.json('OK!, server for db is running perfectly'); //akan muncul di route domian localhost:port/test
}) //testing server dan endpoint 

app.listen(3000, () =>{
    console.log("server running on port 3000") //akan muncul di terminal jika node aktif dan server nyala
}) //port node, backend port
