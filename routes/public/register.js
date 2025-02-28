import express from 'express';


const app = express();
//app.use(express.json())
const router = express.Router()

router.post('/register', async (req,res) => {

    try{ 

        const { name , email ,password} = req.body

        console.log(name, email, password)

        res.status(200).json({message: "Funcionando"})

    } catch(err){
        console.error(err)
        return res.status(500).json({error: 'error ao cadastrar usuario'})
    }
  


})

export default router 
