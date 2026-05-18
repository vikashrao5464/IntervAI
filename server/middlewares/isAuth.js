// Middleware: verify JWT from cookie and set req.userId
import jwt from 'jsonwebtoken';
const isAuth=(req,res,next)=>{
    try{
       let {token}=req.cookies;
       if(!token){
        return res.status(400).json({message:"user not authenticated"});
       }

       const verifyToken=jwt.verify(token,process.env.JWT_SECRET);
       if(!verifyToken){
        return res.status(400).json({message:"user not have a valid token"});
       }

       req.userId=verifyToken.userId;
       next();
    }catch(error){
        return res.status(500).json({message:`auth middleware error: ${error}`});
    }
}
export default isAuth;