import express from 'express';
import bycrypt from 'bcrypt'

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router()

router.post('/register', async (req, res) => {

    try {

        const { name, email, password } = req.body

        const salts = 10

        const hashPassword = await bycrypt.hash(password, salts)

        console.log(name, email, hashPassword)

        res.status(200).json({ message: "Funcionando" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'error ao cadastrar usuario' })
    }



})


/*router.get('/', () => {


    async function testConnection() {
        try {
            await prisma.$connect();
            console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
        } catch (error) {
            console.error("❌ Erro ao conectar com o banco de dados:", error);
        } finally {
            await prisma.$disconnect();
        }
    }

    testConnection();


})*/



export default router 
