import pkg from 'pg'; //wajib, kalo pake postgres database. pkg bisa diganti 'pisang'
import dotenv from 'dotenv' //import dotenv biar bisa baca file env

dotenv.config({ path: "../../.env"}) //syntax untuk kemampuan mengambil sesuatu dari file dotenv

const { Pool } = pkg; //ngambil class dari variabel 'pkg' yang mendefinisikan postgres

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'to_do_user',
    password: process.env.DB_PASSWORD,
    port: 5432
}) //pool aja buat connect ke db, isinya demikian.

if (!process.env.DB_PASSWORD) {
  throw new Error("DB_PASSWORD is missing in .env");
}

if (!pool) {
  throw new Error('test aja')
}

export default pool;