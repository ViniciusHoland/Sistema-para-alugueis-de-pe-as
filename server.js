import express  from 'express';
import dotenv from 'dotenv'
import register from './routes/public/register.js'
import login from './routes/public/login.js'
import pecas from './routes/private/pecas.js'
import auth  from './midllewares/auth.js'
import cliente from './routes/private/cliente.js'

const app = express()
app.use(express.json())
dotenv.config()

app.use(register)
app.use(login)
app.use(auth,pecas)
app.use(auth,cliente)

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})

