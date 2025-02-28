import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()
const prisma = new PrismaClient()


router.post('/login', async (req, res) => {

    try{

        const { email, password} = req.body

        const user = await prisma.user.findUnique({where : {email : email}})

        if(!user){
            return res.status(404).json({ message: "Usuário não encontrado" })
        }

        const hashPassword = await bcrypt.compare(password, user.password)

        if(!user.password == hashPassword){
            return res.status(401).json({ message: "Senha incorreta" })
        } 

        const token = jwt.sign({id : user.id},process.env.JWT_SECRET, {expiresIn: '10h'})

        res.status(200).json({message: "Login realizado com sucesso", token: token})



    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "erro ao fazer login" })
    }  


})

export default router