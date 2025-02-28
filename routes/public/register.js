import express from 'express';
import bcrypt from 'bcrypt'
import { z} from 'zod'

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const router = express.Router()

const userSchema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8, "a senha deve conter mais de 8 digitos").max(255)
})

router.post('/register', async (req, res) => {

    try {

        const result = userSchema.safeParse(req.body)

        if(!result.success){
            return res.status(400).json({ error: 'Por favor, verifique os dados fornecidos' })
        }

        const { name, email, password } = req.body

        const salts = 10

        if(await prisma.user.findUnique( {where : {email : email}} )){
            return res.status(400).json({ error: 'Email já cadastrado' })
        }

        const hashPassword = await bcrypt.hash(password, salts)

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password : hashPassword
            }
        })

        res.status(201).json({ message: `Usuario ${name} registrado com sucesso `})

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'erro ao cadastrar usuario' })
    }



})



export default router 
