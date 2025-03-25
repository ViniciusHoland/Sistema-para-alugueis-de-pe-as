import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv'
import {z } from 'zod'

dotenv.config()

const router = express.Router()
const prisma = new PrismaClient()

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "a senha deve conter mais de 8 digitos").max(255)
})

router.post('/login', async (req, res) => {

    try{

        const result = userSchema.safeParse(req.body)

        if(!result.success){
            return res.status(400).json({ error: 'Por favor, verifique os dados fornecidos' })
        }

        const { email, password} = req.body

        const user = await prisma.user.findUnique({where : {email : email}})

        if(!user){
            return res.status(404).json({ message: "Usuário não encontrado" })
        }

        const hashPassword = await bcrypt.compare(password, user.password)

        if(!user.password == hashPassword){
            return res.status(401).json({ message: "Senha incorreta" })
        } 

        const token = jwt.sign({id : user.id}, process.env.JWT_SECRET, {expiresIn: '10h'})

        console.log(`O usuario ${user.name} fez login`)

        res.status(200).json({message: "Login realizado com sucesso", token: token})



    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "erro ao fazer login" })
    }  


})

export default router