import express from 'express';
import { PrismaClient } from '@prisma/client';
import { number } from 'zod';

const prisma = new PrismaClient()
const router = express.Router()

router.post('/alugueis/registro', async (req , res ) => {

    try{

        const {idCliente, idPeca , quantidade} = req.body
        let { dataInicio , dataFim } = req.body


        if(!idCliente || !idPeca || !quantidade || !dataInicio  || !dataFim){
            return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios' })
        }

        const clienteId = parseInt(idCliente)

        if(!await prisma.cliente.findUnique({where: {id: clienteId}})){
            return res.status(404).json({ error: 'Cliente não encontrado' })
        }

        const [ano, mes,dia ] = dataInicio.split('-')
        const dataFormatInicio = `${ano}/${mes}/${dia}`
        dataInicio = new Date(dataFormatInicio)

        const [anoF, mesF, diaF] = dataFim.split('-')
        const dateFormatFim = `${anoF}/${mesF}/${diaF}`
        dataFim = new Date(dateFormatFim)

        const userId = req.userId

        const peca = await prisma.peca.findUnique({where: { id : parseInt(idPeca)} })

        if(!peca){
            return res.status(404).json({ error: 'Peça não encontrada' })
        }

        const totalDias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24))
        const valorTotal = (totalDias * peca.valorDiario * quantidade).toFixed(2).toString() 

        const nomedaPeca = peca.name.toString()
        const precoUnitarioPeca = peca.valorDiario.toFixed(2)

        const quantidadePecas = parseInt(quantidade)

        const itensAluguel = {
            pecaId: peca.id,
            nomePeca : nomedaPeca,
            quantidade: quantidadePecas,
            precoUnitario: precoUnitarioPeca
        }

        
        
        const newAluguel = await prisma.aluguel.create({
            data: {
              clienteId,
              userId,
              dataInicio,
              dataFim,
              quantidadeDias: totalDias,
              valorTotal,
              status : "aberto",
              aluguelItens: {
                create: itensAluguel
              }

            }
        })
       
    
        res.status(201).json(newAluguel)


    } catch(err){
        console.log(err)
        res.status(500).send('Erro ao cadastrar aluguel')
    }


})

router.get('/alugueis/cliente/:idCliente', async (req, res) => {

    try{

        const {idCliente} = req.params

        if(!idCliente){
            return res.status(400).json({ error: 'Por favor, passe um id de cliente' })
        }

        const clienteId = parseInt(idCliente)

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

            idAluguel: aluguel.id,
            nomeCliente: aluguel.cliente.nome,
            endereco: aluguel.cliente.endereco,
            telefone: aluguel.cliente.telefone,
            dataInicio: aluguel.dataInicio,
            dataFim: aluguel.dataFim,
            quantidadeDias: aluguel.quantidadeDias,
            total: aluguel.valorTotal.toFixed(2),
            status: aluguel.status,
            itens: aluguel.aluguelItens.map(item => ({
                peca: item.nomePeca,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario.toFixed(2)
            }))
        }))

    
        res.status(200).json({
            cliente: nomeCliente,
            totalAlugueis: alugueis.length,
            alugueis: dadosAlugueis
        })

    

    }catch (err){
        console.error(err)
        return res.status(500).json({ message: 'Erro ao buscar alugueis' })
    }

})

router.get('/alugueis', async (req, res) => {

    try{

        
        const alugueis = await prisma.aluguel.findMany({ 
            include: {
                aluguelItens: true,
                cliente: true,
                user: true
            }
        })

        if(!alugueis){
            return res.status(404).json({ error: 'Alugueis não encontrados' })
        }
       
        const dadosAlugueis = alugueis.map(aluguel => ({

            status: aluguel.status,
            idCliente: aluguel.cliente.id,
            idAluguel: aluguel.id,
            nomeCliente: aluguel.cliente.nome,
            dataInicio: aluguel.dataInicio,
            dataFim: aluguel.dataFim,
            quantidadeDias: aluguel.quantidadeDias,
            valorTotal: aluguel.valorTotal.toFixed(2),
            status: aluguel.status,
            itens: aluguel.aluguelItens.map(item => ({
                peca: item.nomePeca,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario.toFixed(2)
            }))
        }))

        res.status(200).json({
            totalAlugueis: alugueis.length,
            alugueis: dadosAlugueis
        })

    

    }catch (err){
        console.error(err)
        return res.status(500).json({ message: 'Erro ao buscar alugueis' })
    }

})


router.put('/alugueis/:aluguelId', async (req, res) => {

    try{

        const { aluguelId } = req.params

        if(!aluguelId){
            return res.status(400).json({ error: 'Por favor, passe um id de aluguel' })
        }

        const idAluguel = parseInt(aluguelId)

        const aluguel = await prisma.aluguel.findUnique({where: {id : idAluguel}})

        if(!aluguel){
            return res.status(404).json({ error: 'Aluguel não encontrado' })
        }

        if(!req.body.status === "fechado") {
            const {clienteId , idPeca , quantidade} = req.body
            let { dataInicio , dataFim } = req.body
    
            if(!clienteId || !idPeca || !quantidade || !dataInicio  || !dataFim){
                return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios' })
            }
    
    
            if(!await prisma.cliente.findUnique({where: {id: clienteId}})){
                return res.status(404).json({ error: 'Cliente não encontrado' })
            }
    
            const peca= await prisma.peca.findUnique({where: {id: idPeca}})
    
            const userId = req.userId
    
            const [dia, mes , ano] = dataInicio.split('/')
            const dataFormatInicio = `${ano}/${mes}/${dia}`
            dataInicio = new Date(dataFormatInicio)
    
            const [diaF, mesF , anoF] = dataFim.split('/')
            const dateFormatFim = `${anoF}/${mesF}/${diaF}`
            dataFim = new Date(dateFormatFim)
    
            const totalDias= Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24))
    
            const itensAluguel = {
                pecaId: peca.id,
                nomePeca : peca.name,
                quantidade,
                precoUnitario: peca.valorDiario
            }
    
    
            console.log(aluguel)
    
            const updateAluguel = await prisma.aluguel.update({
                where: {id : idAluguel},
                data: {
                    clienteId,
                    userId: userId,
                    dataInicio,
                    dataFim,
                    quantidadeDias: totalDias,
                    status : "aberto",
                    aluguelItens: {
                        create: itensAluguel
                    }
                }
            })
    
            res.status(200).json(updateAluguel)
        }

        const updateAluguel = await prisma.aluguel.update({
            where: {id : idAluguel},
            data: {
                    status: "fechado"
                }
            
        })

       
        res.status(200).json(updateAluguel)

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Erro ao editar aluguel' })
    } 


})







export default router