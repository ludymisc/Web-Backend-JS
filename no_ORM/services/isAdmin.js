function IsAdmin(req, res, next) { //ini file cuma buat cek role user, anj
    if (!req.user || req.user.role !== 'admin') { //cek, role user
        // Asumsi: req.user sudah di-set oleh middleware autentikasi
        //la;p belom autentifikasi, tolak akses.
        return res.status(403).json({
            message: 'akses ditolak, bukan admin atau belum login'
        }) //kalo bukan admin, akses ditolak (akses menyesuaikan end point nanti, ini hanya protokol)
    }
    next() //kalo role admin, lolos pemeriksaan
}

export default IsAdmin
