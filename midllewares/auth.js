import jwt from 'jsonwebtoken'

function verifyToken(req,res,next){

    try{

        const token = req.headers.authorization.split(' ')[1]
        
        if(!token){
            return res.status(401).json({ error: 'Token não fornecido ou Invalido' })
        }

        const data = jwt.verify(token,process.env.JWT_SECRET)

        req.userId = data.id

        next()

    }catch (err){
        return res.status(401).json({ error: 'Token invalido' })
    }


}


export default verifyToken