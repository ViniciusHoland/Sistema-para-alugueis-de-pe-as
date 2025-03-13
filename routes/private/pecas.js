import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router()

const prisma = new PrismaClient()


router.post('/pecas/cadastro', async (req , res) => {

    try{

        const { name , valorDiario} = req.body

        if(!name ||!valorDiario){
            return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios' })
        }

        const newPeca = await prisma.peca.create({
            data:{
                name,
                valorDiario
            }
        })

        res.status(201).json({message: `Peça cadastrada com sucesso `, novaPeca : newPeca})

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Erro ao cadastrar peça" })
    }


})

export default router