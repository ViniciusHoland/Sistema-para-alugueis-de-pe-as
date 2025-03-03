import express from 'express';
import { PrismaClient } from '@prisma/client';
import { pipeline } from 'zod';

const prisma = new PrismaClient()
const router = express.Router()

router.post('/alugueis/registro', async (req , res ) => {

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

router.get('/alugueis/:idCliente', async (req, res) => {

    try{

        const {idCliente} = req.params

        const clienteId = parseInt(idCliente)

        if(!clienteId){
            return res.status(400).json({ error: 'Por favor, passe um id de cliente' })
        }

        const cliente = await prisma.cliente.findUnique({where: { id : clienteId} })

        if(!cliente){
            return res.status(400).json({ error: 'cliente nao encontrado' })
        }

        const alugueis = await prisma.aluguel.findMany({
            where: {clienteId: clienteId}, 
            include: {
                aluguelItens: true,
                cliente: true,
                user: true
            }
        })

        if(!alugueis){
            return res.status(404).json({ error: 'Alugueis não encontrados' })
        }


        const nomeCliente = alugueis[0].cliente.nome

        const dadosAlugueis = alugueis.map(aluguel => ({

            dataInicio: aluguel.dataInicio,
            dataFim: aluguel.dataFim,
            total: aluguel.valorTotal.toFixed(2),
            status: aluguel.status,
            itens: aluguel.aluguelItens.map(item => ({
                peca: item.name,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario
            }))
        }))

    
        res.json({
            cliente: nomeCliente,
            totalAlugueis: alugueis.length,
            alugueis: dadosAlugueis
        })



    }catch (err){
        console.error(err)
        return res.status(500).json({ message: 'Erro ao buscar alugueis' })
    }



})


export default router