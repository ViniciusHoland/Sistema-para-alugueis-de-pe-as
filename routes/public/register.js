import express from 'express';
import bycrypt from 'bcrypt'

const router = express.Router()

router.post('/register', async (req,res) => {

    try{ 

        const { name , email ,password} = req.body

        const salts = 10 

        const hashPassword = await bycrypt.hash(password,salts)

        console.log(name, email, hashPassword)

        res.status(200).json({message: "Funcionando"})

    } catch(err){
        console.error(err)
        return res.status(500).json({error: 'error ao cadastrar usuario'})
    }
  


})

export default router 
