import express from 'express';
import { PrismaClient } from '@prisma/client';
import { pipeline } from 'zod';

const prisma = new PrismaClient()
const router = express.Router()

router.post('/registro/pecas', async (req , res ) => {

    try{

        const {clienteId , idPeca , quantidade} = req.body
        let { dataInicio , dataFim } = req.body

        if(!clienteId || !idPeca || !quantidade || !dataInicio  || !dataFim){
            return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios' })
        }

        const [dia, mes , ano] = dataInicio.split('/')
        const dataFormatInicio = `${ano}/${mes}/${dia}`
        dataInicio = new Date(dataFormatInicio)

        const [diaF, mesF , anoF] = dataFim.split('/')
        const dateFormatFim = `${anoF}/${mesF}/${diaF}`
        dataFim = new Date(dateFormatFim)

        const userId = req.userId

        const peca = await prisma.peca.findUnique({where: { id : idPeca} })

        if(!peca){
            return res.status(404).json({ error: 'Peça não encontrada' })
        }

        const totalDias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24))
        const valorTotal = (totalDias * peca.valorDiario * quantidade).toFixed(2).toString() 

        const itensAluguel = {
            pecaId: peca.id,
            quantidade,
            precoUnitario: peca.valorDiario
        }

        
        
        const newItemAluguel = await prisma.aluguel.create({
            data: {
              clienteId,
              userId,
              dataInicio,
              dataFim,
              valorTotal,
              status : "aberto",
              aluguelItens: {
                create: itensAluguel
              }

            }
        })
       

    
        res.status(201).json(newItemAluguel)


    } catch(err){
        console.log(err)
        res.status(500).send('Erro ao cadastrar aluguel')
    }


})




export default router