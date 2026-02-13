import {prisma} from '../../lib/prisma.js'

//end point route for user info
export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const getMe = await prisma.users.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                role: true
            }
        });

        if (!getMe) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: getMe });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" });
    }
}

//change user role by admin end point
export const changeRole = async(req, res) => {
    try{
        const { id } = req.params;
        const { role } = req.body;

        if(!['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: "role tidak valid" })
        }

        if(Number(id) === req.user.id) {
            return res.status(400).json({ message: "gak bisa mengubah role sendiri, admin bloon" })
        }

        await prisma.users.update({
            data: {
                role: role
            },
            where: {
                id: id
            }
        })

        res.json({ message: "role telah berubah, cek aja kalo gak percaya" })
    } catch (error){
        res.status(500).json({ message: "cek kode atau database, ini backend, errornya gak jauh" })
    }
}