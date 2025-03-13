import express from "express";
import { PrismaClient } from "@prisma/client";


const router = express.Router()
const prisma= new PrismaClient();

router.post('/clientes/cadastro', async (req, res ) => {

    try{

        const { nome ,cpfCnpj, email, telefone , endereco} = req.body

        if(!nome || !cpfCnpj || !email || !telefone || !endereco){
            return res.status(400).json({ error: 'Por favor, preencha todos os campos' })  // Campos vazios
        }

        const cliente = await prisma.cliente.findUnique({where:{email: email}})
    
        if(cliente){
            return res.status(400).json({ error: 'Email já cadastrado' })  // Email já cadastrado
        }

        const newCliente = await prisma.cliente.create({
            data: {
                nome,
                cpfCnpj,
                email,
                telefone,
                endereco : {
                    rua: req.body.endereco.rua,
                    numero: req.body.endereco.numero,
                    bairro: req.body.endereco.bairro
                }
            }
        })

        res.status(201).json({message: `Cliente ${newCliente.nome} cadastrado com sucesso`})

    }catch (err){ 
        console.error(err)
        return res.status(500).json({ message: 'Erro ao cadastrar cliente' })
    }

})

export default router